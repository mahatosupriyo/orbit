"use server"

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { revalidatePath } from "next/cache"
import { db } from "@/server/db"
import { auth } from "@/auth"
import sharp from "sharp"
import crypto from "crypto"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.ORBIT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.ORBIT_S3_BUCKET_NAME!
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const AVATAR_SIZE = 180
const WEBP_QUALITY = 80

/**
 * Updates the user's avatar by uploading to S3 and updating the database
 */
export async function updateAvatar(formData: FormData) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("You must be logged in to update your avatar")
    }

    // Validate uploaded file
    const file = formData.get("file")
    if (!(file instanceof File)) {
      throw new Error("No valid file uploaded")
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Please upload a JPEG, PNG, GIF, or WebP image")
    }

    // Get current user data
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    })

    if (!currentUser) {
      throw new Error("User not found")
    }

    // Generate unique filename
    const fileHash = crypto.createHash("md5").update(`${Date.now()}-${file.name}`).digest("hex")
    const fileName = `avatar/${session.user.id}/${fileHash}.webp`

    // Process image: resize and convert to WebP
    const fileBuffer = await file.arrayBuffer()
    const processedImage = await sharp(Buffer.from(fileBuffer))
      .resize({ width: AVATAR_SIZE, height: AVATAR_SIZE, fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: processedImage,
        ContentType: "image/webp",
      }),
    )

    // Delete old avatar if it exists (skip default avatars and external URLs)
    if (currentUser.image && !currentUser.image.startsWith("http") && currentUser.image !== "defaultavatar.png") {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: currentUser.image,
          }),
        )
      } catch (deleteError) {
        console.error("Failed to delete old avatar:", deleteError)
        // Continue execution - don't fail the upload if old image deletion fails
      }
    }

    // Update user in database
    await db.user.update({
      where: { id: session.user.id },
      data: {
        image: fileName,
        lastImageUpdate: new Date(),
      },
    })

    // Revalidate cache
    revalidatePath("/")

    return { success: true, message: "Avatar updated successfully" }
  } catch (error) {
    console.error("Avatar upload error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update avatar",
    }
  }
}
