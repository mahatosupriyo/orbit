"use server";

import { db } from "@/server/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { Prisma } from "@prisma/client";


const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
};

// Utility to sanitize the search input into individual keywords
function sanitizeInput(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .split(/\s+/) // split by space
    .filter((word) => word.length > 1); // remove short tokens
}

export async function searchGaragePosts(userInput: string) {
  try {
    if (!userInput || userInput.trim().length === 0) return [];

    const keywords = sanitizeInput(userInput);
    if (keywords.length === 0) return [];

    const searchConditions: Prisma.GaragePostWhereInput[] = keywords.map((keyword) => ({
      OR: [
        {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          caption: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      ],
    }));

    const posts = await db.garagePost.findMany({
      where: {
        AND: searchConditions,
      },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Sign CloudFront URLs
    const postsWithSignedUrls = await Promise.all(
      posts.map(async (post) => {
        const signedImages = await Promise.all(
          post.images.map(async (image) => {
            const url = `${cloudfrontEnv.cloudfrontUrl}/${image.playbackID}`;
            try {
              const signedUrl = getSignedUrl({
                url,
                keyPairId: cloudfrontEnv.keyPairId,
                privateKey: cloudfrontEnv.privateKey,
                dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h
              });

              return {
                id: image.id,
                url: signedUrl,
                order: image.order,
              };
            } catch (err) {
              console.error("Error signing image URL:", err);
              return null;
            }
          })
        );

        return {
          ...post,
          images: signedImages.filter(Boolean) as Array<{ id: number; url: string; order: number | null }>,
        };
      })
    );

    return postsWithSignedUrls;
  } catch (error) {
    console.error("[SEARCH ERROR]:", error);
    return [];
  }
}
