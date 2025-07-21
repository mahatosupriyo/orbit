"use server"

import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
import { db } from "@/server/db"

const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
}

export async function getGaragePosts(userId: string) {
  try {
    const posts = await db.garagePost.findMany({
      where: { createdById: userId },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Sign all image URLs with better error handling
    const postsWithSignedUrls = await Promise.all(
      posts.map(async (post) => {
        const signedImages = await Promise.all(
          post.images.map(async (image) => {
            const url = `${cloudfrontEnv.cloudfrontUrl}/${image.playbackID}`
            try {
              const signedUrl = getSignedUrl({
                url,
                keyPairId: cloudfrontEnv.keyPairId,
                privateKey: cloudfrontEnv.privateKey,
                dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
              })
              return {
                id: image.id,
                url: signedUrl,
                order: image.order,
              }
            } catch (err) {
              console.error(`Error signing image URL for image ${image.id}:`, err)
              return null
            }
          }),
        )

        // Filter out failed signed URLs
        const validImages = signedImages.filter(Boolean) as Array<{ 
          id: number; 
          url: string; 
          order: number | null 
        }>

        return {
          id: post.id,
          title: post.title,
          caption: post.caption,
          externalUrl: post.externalUrl,
          createdAt: post.createdAt.toISOString(), // Fix: Convert Date to string
          images: validImages,
          makingOf: post.makingOf ? {
            id: post.makingOf.id,
            playbackID: post.makingOf.playbackID,
          } : null,
        }
      }),
    )

    return postsWithSignedUrls
  } catch (error) {
    console.error('Error fetching garage posts:', error)
    throw new Error('Failed to fetch garage posts')
  }
}
