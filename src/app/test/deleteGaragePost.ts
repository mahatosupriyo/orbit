'use server'

import { db } from '@/server/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
    region: process.env.ORBIT_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME = process.env.ORBIT_S3_BUCKET_NAME!

export async function deleteGaragePost(postId: number) {
    const postToDelete = await db.garagePost.findUnique({
        where: { id: postId },
        include: { images: true },
    })

    if (!postToDelete) return

    const imageKeys = postToDelete.images.map((img) => ({ Key: img.playbackID }))
    if (imageKeys.length > 0) {
        try {
            await s3.send(
                new DeleteObjectsCommand({
                    Bucket: BUCKET_NAME,
                    Delete: { Objects: imageKeys },
                })
            )
        } catch (err) {
            console.error('Failed to delete from S3:', err)
        }
    }

    await db.asset.deleteMany({
        where: { id: { in: postToDelete.images.map((img) => img.id) } },
    })

    await db.garagePost.delete({ where: { id: postId } })

    revalidatePath('/test')
    redirect('/test')
}
