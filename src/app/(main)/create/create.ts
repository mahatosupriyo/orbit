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
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_IMAGES = 5
const IMAGE_WIDTH = 1080
const IMAGE_HEIGHT = 1350
const WEBP_QUALITY = 85

export async function uploadGaragePost(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("You must be logged in to upload a post");
    }

    if (session.user.role !== "ADMIN") {
      throw new Error("You are not authorized to upload a garage post");
    }

    const title = formData.get("title")?.toString()
    const caption = formData.get("caption")?.toString() || null
    const externalUrl = formData.get("externalUrl")?.toString() || null
    const makingOfPlaybackID = formData.get("makingOf")?.toString() || null

    if (!title || title.trim() === "") throw new Error("Title is required")

    const files = formData.getAll("images").filter((f) => f instanceof File) as File[]
    if (files.length === 0) throw new Error("At least one image must be uploaded")
    if (files.length > MAX_IMAGES) throw new Error("You can only upload up to 5 images")

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Unsupported file type")
      if (file.size > MAX_IMAGE_SIZE) throw new Error("Each image must be below 5MB")
    }

    // Create GaragePost entry first
    const newPost = await db.garagePost.create({
      data: {
        title,
        caption,
        externalUrl,
        createdById: session.user.id,
      },
    })

    // Upload each image with ordering
    const uploadedAssets = await Promise.all(
      files.map(async (file, index) => {
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const fileHash = crypto.createHash("md5").update(`${Date.now()}-${file.name}`).digest("hex")
        const fileName = `garage/${session.user.id}/${newPost.id}/images/${fileHash}.webp`

        const processedImage = await sharp(fileBuffer)
          .resize({ width: IMAGE_WIDTH, height: IMAGE_HEIGHT, fit: "cover" })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer()

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: processedImage,
            ContentType: "image/webp",
          })
        )

        return db.asset.create({
          data: {
            playbackID: fileName,
            order: index,
          },
        })
      })
    )

    // Connect assets to the garage post
    await db.garagePost.update({
      where: { id: newPost.id },
      data: {
        images: {
          connect: uploadedAssets.map((asset) => ({ id: asset.id })),
        },
      },
    })

    // Connect makingOf video if provided
    if (makingOfPlaybackID) {
      const videoAsset = await db.asset.create({
        data: {
          playbackID: makingOfPlaybackID,
        },
      })

      await db.garagePost.update({
        where: { id: newPost.id },
        data: {
          makingOf: {
            connect: { id: videoAsset.id },
          },
        },
      })
    }

    revalidatePath("/garage")

    return {
      success: true,
      message: "Garage post uploaded successfully",
    }
  } catch (error) {
    console.error("GaragePost upload error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    }
  }
}
