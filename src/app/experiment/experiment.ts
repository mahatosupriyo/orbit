// "use server";

// import { db } from "@/server/db";
// import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
// import { Prisma } from "@prisma/client";
// import OpenAI from "openai";
// import { redis } from "@/utils/redis"; // your redis setup

// const MAX_QUERY_LENGTH = 100; // Max input length
// const RATE_LIMIT_WINDOW = 60; // seconds
// const RATE_LIMIT_MAX = 20; // max requests per window

// const cloudfrontEnv = {
//   keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
//   privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
//   cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
// };

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// /**
//  * Token sanitization for fallback and deduplication.
//  */
// function sanitizeTokens(text: string): string[] {
//   const tokens = text
//     .toLowerCase()
//     .replace(/[^\w\s]/g, "")
//     .split(/\s+/)
//     .filter((t) => t.length > 1);

//   const seen = new Set<string>();
//   return tokens.filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
// }

// /**
//  * Extract keywords from natural language using OpenAI.
//  */
// async function extractKeywords(userInput: string): Promise<string[]> {
//   try {
//     const prompt = `Extract the main keywords from this user query for searching a design-related database. 
// Return only a comma-separated list without extra words: ${userInput}`;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You are a precise keyword extractor." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0,
//       max_tokens: 40,
//     });

//     const raw = response.choices?.[0]?.message?.content?.trim() || "";
//     let parts = raw.split(",").map((k) => k.trim());
//     if (parts.length === 1) parts = raw.split(/\s+/).map((k) => k.trim());

//     const cleaned = sanitizeTokens(parts.join(" "));
//     return cleaned.length > 0 ? cleaned : sanitizeTokens(userInput);
//   } catch (err) {
//     console.error("[OPENAI ERROR]:", err);
//     return sanitizeTokens(userInput);
//   }
// }

// /**
//  * Redis-based rate limit
//  */
// async function checkRateLimit(identifier: string) {
//   const key = `search:rate:${identifier}`;
//   const requests = await redis.incr(key);

//   if (requests === 1) {
//     await redis.expire(key, RATE_LIMIT_WINDOW);
//   }

//   return requests <= RATE_LIMIT_MAX;
// }

// export async function searchGaragePosts(
//   userInput: string,
//   userIp?: string,
//   cursor?: number // for pagination
// ) {
//   try {
//     const q = (userInput || "").trim();

//     // 1) Validate input
//     if (!q) return { posts: [], hasMore: false, nextCursor: null };
//     if (q.length > MAX_QUERY_LENGTH) {
//       throw new Error("Search query too long");
//     }

//     // 2) Rate limit
//     const identifier = userIp || "global";
//     const allowed = await checkRateLimit(identifier);
//     if (!allowed) throw new Error("Too many searches. Try again in 1 minute.");

//     // 3) Extract keywords
//     const keywords = await extractKeywords(q);
//     if (keywords.length === 0)
//       return { posts: [], hasMore: false, nextCursor: null };

//     // 4) Build search conditions
//     const searchConditions: Prisma.GaragePostWhereInput[] = keywords.map(
//       (keyword) => ({
//         OR: [
//           { title: { contains: keyword, mode: "insensitive" } },
//           { caption: { contains: keyword, mode: "insensitive" } },
//         ],
//       })
//     );

//     // 5) Fetch posts with user included
//     const posts = await db.garagePost.findMany({
//       where: {
//         OR: searchConditions,
//         ...(cursor && { id: { lt: cursor } }), // pagination: older than cursor
//       },
//       include: {
//         createdBy: true, // get user info including username
//         images: { orderBy: { order: "asc" } },
//         makingOf: true,
//       },
//       orderBy: { createdAt: "desc" },
//       take: 11, // fetch 1 extra to check if more exist
//     });

//     // 6) Prepare pagination info
//     const hasMore = posts.length > 10;
//     const data = hasMore ? posts.slice(0, 10) : posts;

//     // 7) Sign CloudFront URLs for images
//     const postsWithSignedUrls = await Promise.all(
//       data.map(async (post) => {
//         const signedImages = await Promise.all(
//           post.images.map(async (image) => {
//             const url = `${cloudfrontEnv.cloudfrontUrl}/${image.playbackID}`;
//             try {
//               const signedUrl = getSignedUrl({
//                 url,
//                 keyPairId: cloudfrontEnv.keyPairId,
//                 privateKey: cloudfrontEnv.privateKey,
//                 dateLessThan: new Date(
//                   Date.now() + 1000 * 60 * 60 * 24
//                 ).toISOString(),
//               });
//               return { id: image.id, url: signedUrl, order: image.order };
//             } catch (err) {
//               console.error("Error signing image URL:", err);
//               return null;
//             }
//           })
//         );

//         return {
//           id: post.id,
//           title: post.title,
//           caption: post.caption ?? "",
//           createdAt: post.createdAt,
//           updatedAt: post.updatedAt,
//           createdBy: {
//             id: post.createdBy.id,
//             name: post.createdBy.name ?? "",
//             username: post.createdBy.username ?? "Unknown",
//             image: post.createdBy.image ?? null,
//           },
//           images: signedImages.filter(Boolean),
//           makingOf: post.makingOf,
//           assetId: post.assetId,
//         };
//       })
//     );

//     return {
//       posts: postsWithSignedUrls,
//       hasMore,
//       nextCursor: hasMore
//         ? postsWithSignedUrls[postsWithSignedUrls.length - 1].id
//         : null,
//     };
//   } catch (error) {
//     console.error("[SEARCH ERROR]:", error);
//     return { posts: [], hasMore: false, nextCursor: null };
//   }
// }


"use server";

import { db } from "@/server/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { redis } from "@/utils/redis";
import { getAvatarByUserId } from "@/components/atoms/avatar/getAvatarbyID"; // Adjust path as needed

const MAX_QUERY_LENGTH = 100;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 20;

const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function sanitizeTokens(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const seen = new Set<string>();
  return tokens.filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
}

async function extractKeywords(userInput: string): Promise<string[]> {
  try {
    const prompt = `Extract the main keywords from this user query for searching a design-related database. 
Return only a comma-separated list without extra words: ${userInput}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precise keyword extractor." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 40,
    });

    const raw = response.choices?.[0]?.message?.content?.trim() || "";
    let parts = raw.split(",").map((k) => k.trim());
    if (parts.length === 1) parts = raw.split(/\s+/).map((k) => k.trim());

    const cleaned = sanitizeTokens(parts.join(" "));
    return cleaned.length > 0 ? cleaned : sanitizeTokens(userInput);
  } catch (err) {
    console.error("[OPENAI ERROR]:", err);
    return sanitizeTokens(userInput);
  }
}

async function checkRateLimit(identifier: string) {
  const key = `search:rate:${identifier}`;
  const requests = await redis.incr(key);

  if (requests === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }

  return requests <= RATE_LIMIT_MAX;
}

export async function searchGaragePosts(
  userInput: string,
  userIp?: string,
  cursor?: number
) {
  try {
    const q = (userInput || "").trim();

    if (!q) return { posts: [], hasMore: false, nextCursor: null };
    if (q.length > MAX_QUERY_LENGTH) throw new Error("Search query too long");

    const identifier = userIp || "global";
    const allowed = await checkRateLimit(identifier);
    if (!allowed) throw new Error("Too many searches. Try again in 1 minute.");

    const keywords = await extractKeywords(q);
    if (keywords.length === 0) return { posts: [], hasMore: false, nextCursor: null };

    const searchConditions: Prisma.GaragePostWhereInput[] = keywords.map((keyword) => ({
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        { caption: { contains: keyword, mode: "insensitive" } },
      ],
    }));

    const posts = await db.garagePost.findMany({
      where: {
        OR: searchConditions,
        ...(cursor && { id: { lt: cursor } }),
      },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
        createdBy: true, // include user to get userId for avatar
      },
      orderBy: { createdAt: "desc" },
      take: 11,
    });

    const hasMore = posts.length > 10;
    const data = hasMore ? posts.slice(0, 10) : posts;

    // Sign CloudFront URLs and get avatars
    const postsWithSignedUrls = await Promise.all(
      data.map(async (post) => {
        // Sign post images
        const signedImages = await Promise.all(
          post.images.map(async (image) => {
            const url = `${cloudfrontEnv.cloudfrontUrl}/${image.playbackID}`;
            try {
              const signedUrl = getSignedUrl({
                url,
                keyPairId: cloudfrontEnv.keyPairId,
                privateKey: cloudfrontEnv.privateKey,
                dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
              });
              return { id: image.id, url: signedUrl, order: image.order };
            } catch (err) {
              console.error("Error signing image URL:", err);
              return null;
            }
          })
        );

        // Get signed avatar url
        const avatarUrl = await getAvatarByUserId(post.createdById);

        return {
          ...post,
          avatarUrl,
          images: signedImages.filter(Boolean) as Array<{
            id: number;
            url: string;
            order: number | null;
          }>,
        };
      })
    );

    return {
      posts: postsWithSignedUrls,
      hasMore,
      nextCursor: hasMore ? postsWithSignedUrls[postsWithSignedUrls.length - 1].id : null,
    };
  } catch (error) {
    console.error("[SEARCH ERROR]:", error);
    return { posts: [], hasMore: false, nextCursor: null };
  }
}
