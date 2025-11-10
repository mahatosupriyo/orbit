"use server"

import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3"
import { revalidatePath } from "next/cache"
import { db } from "@/server/db"
import { auth } from "@/auth"
import sharp from "sharp"
import crypto from "crypto"

const s3Client = new S3Client({
    region: process.env.ORBIT_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME = process.env.ORBIT_S3_BUCKET_NAME!
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_IMAGES = 5
const IMAGE_WIDTH = 1080
const IMAGE_HEIGHT = 1350
const WEBP_QUALITY = 85

// ---- TEXT SANITIZATION / FORMATTING ----
function normalizePostText(text: string) {
    if (!text) return ""

    // Normalize line endings
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

    // Remove leading/trailing whitespace
    text = text.trim()

    // Collapse more than 1 blank line → 1 blank line
    text = text.replace(/\n{3,}/g, "\n\n")

    // Wrap URLs: #^#example.com#^#
    const urlPattern =
        /(?:https?:\/\/[^\s#]+|www\.[^\s#]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s#]*)?)/gi

    text = text.replace(urlPattern, (match) => `#^#${match}#^#`)

    return text
}

export async function uploadGaragePost(formData: FormData): Promise<{ success: boolean; message: string }> {
    try {
        const session = await auth()

        // Only logged-in admin can post
        if (!session?.user?.id) {
            return { success: false, message: "Not authenticated" }
        }
        if (session.user.role !== "ADMIN") {
            return { success: false, message: "Not authorized" }
        }

        // Extract form fields
        let title = formData.get("title")?.toString() || ""
        let caption = formData.get("caption")?.toString() || null
        const externalUrl = formData.get("externalUrl")?.toString() || null
        const makingOfPlaybackID = formData.get("makingOf")?.toString() || null

        // Apply server text normalization
        title = normalizePostText(title)
        if (caption) caption = normalizePostText(caption)

        if (!title) {
            return { success: false, message: "Post text/title cannot be empty" }
        }

        // Files validation
        const files = formData.getAll("images").filter(f => f instanceof File) as File[]
        if (files.length === 0) return { success: false, message: "At least one image is required" }
        if (files.length > MAX_IMAGES) return { success: false, message: "You can upload up to 5 images only" }

        for (const file of files) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { success: false, message: "Unsupported image format" }
            if (file.size > MAX_IMAGE_SIZE) return { success: false, message: "Image exceeds size limit (10MB)" }
        }

        // Create DB post
        const newPost = await db.garagePost.create({
            data: {
                title,
                caption,
                externalUrl,
                createdById: session.user.id,
            },
        })

        // Upload images to S3
        const uploadedAssets = await Promise.all(
            files.map(async (file, index) => {
                const fileBuffer = Buffer.from(await file.arrayBuffer())
                const fileHash = crypto.createHash("md5").update(`${Date.now()}-${file.name}`).digest("hex")
                const fileName = `garage/${session.user.id}/${newPost.id}/images/${fileHash}.webp`

                const processedImage = await sharp(fileBuffer)
                    .resize({ width: IMAGE_WIDTH, height: IMAGE_HEIGHT, fit: "cover" })
                    .webp({ quality: WEBP_QUALITY })
                    .toBuffer()

                await s3Client.send(new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                    Body: processedImage,
                    ContentType: "image/webp",
                }))

                return db.asset.create({
                    data: { playbackID: fileName, order: index },
                })
            })
        )

        await db.garagePost.update({
            where: { id: newPost.id },
            data: { images: { connect: uploadedAssets.map(a => ({ id: a.id })) } },
        })

        // If making-of video exists
        if (makingOfPlaybackID) {
            const videoAsset = await db.asset.create({
                data: { playbackID: makingOfPlaybackID },
            })

            await db.garagePost.update({
                where: { id: newPost.id },
                data: { makingOf: { connect: { id: videoAsset.id } } },
            })
        }

        revalidatePath("/test")

        return { success: true, message: "Post uploaded successfully" }

    } catch (error) {
        console.error("GaragePost upload error:", error)
        return { success: false, message: "Server error while uploading post" }
    }
}
