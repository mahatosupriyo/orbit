"use server"

import { db } from "@/server/db"
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3"
import { revalidatePath } from "next/cache"

// S3 client setup
const s3 = new S3Client({
    region: process.env.ORBIT_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME = process.env.ORBIT_S3_BUCKET_NAME!

export async function deleteGaragePost(postId: number, userId: string) {
    const post = await db.garagePost.findFirst({
        where: { id: postId, createdById: userId },
        include: {
            images: true,
            makingOf: true,
        },
    })

    if (!post) {
        throw new Error("Post not found or unauthorized")
    }

    // 1. Prepare list of S3 objects to delete
    const s3Objects = [
        ...post.images.map((img) => ({ Key: img.playbackID })),
        ...(post.makingOf ? [{ Key: post.makingOf.playbackID }] : []),
    ]

    // 2. Delete from S3
    if (s3Objects.length > 0) {
        try {
            await s3.send(
                new DeleteObjectsCommand({
                    Bucket: BUCKET_NAME,
                    Delete: {
                        Objects: s3Objects,
                    },
                }),
            )
        } catch (err) {
            console.error("Failed to delete S3 assets:", err)
        }
    }

    // 3. Delete asset records from DB
    const assetIds = [
        ...post.images.map((img) => img.id),
        ...(post.makingOf ? [post.makingOf.id] : []),
    ]

    if (assetIds.length > 0) {
        await db.asset.deleteMany({
            where: { id: { in: assetIds } },
        })
    }

    // 4. Delete post
    await db.garagePost.delete({
        where: { id: postId },
    })

    // 5. Revalidate path if needed (optional)
    revalidatePath("/garage")
}
