// "use server"

// import { db } from "@/server/db"
// import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
// import type { Prisma } from "@prisma/client"
// import OpenAI from "openai"
// import { redis } from "@/utils/redis"

// const MAX_QUERY_LENGTH = 100
// const RATE_LIMIT_WINDOW = 60
// const RATE_LIMIT_MAX = 20

// const cloudfrontEnv = {
//   keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
//   privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
//   cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
// }

// const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png"

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// })

// // Use the same signUrl function pattern that works
// async function signUrl(keyOrUrl: string | null): Promise<string> {
//   if (!keyOrUrl) return PLACEHOLDER_AVATAR
//   // If already absolute URL, return as is
//   if (keyOrUrl.startsWith("http")) return keyOrUrl
//   const url = `${cloudfrontEnv.cloudfrontUrl}/${keyOrUrl}`
//   try {
//     return getSignedUrl({
//       url,
//       keyPairId: cloudfrontEnv.keyPairId,
//       privateKey: cloudfrontEnv.privateKey,
//       dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h expiry
//     })
//   } catch (error) {
//     console.error("Failed to sign URL:", error)
//     return PLACEHOLDER_AVATAR
//   }
// }

// function sanitizeTokens(text: string): string[] {
//   const tokens = text
//     .toLowerCase()
//     .replace(/[^\w\s]/g, "")
//     .split(/\s+/)
//     .filter((t) => t.length > 1)
//   const seen = new Set<string>()
//   return tokens.filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
// }

// async function extractKeywords(userInput: string): Promise<string[]> {
//   try {
//     const prompt = `Extract the main keywords from this user query for searching a design-related database. Return only a comma-separated list without extra words: ${userInput}`
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You are a precise keyword extractor." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0,
//       max_tokens: 40,
//     })
//     const raw = response.choices?.[0]?.message?.content?.trim() || ""
//     let parts = raw.split(",").map((k) => k.trim())
//     if (parts.length === 1) parts = raw.split(/\s+/).map((k) => k.trim())
//     const cleaned = sanitizeTokens(parts.join(" "))
//     return cleaned.length > 0 ? cleaned : sanitizeTokens(userInput)
//   } catch (err) {
//     console.error("[OPENAI ERROR]:", err)
//     return sanitizeTokens(userInput)
//   }
// }

// async function checkRateLimit(identifier: string) {
//   const key = `search:rate:${identifier}`
//   const requests = await redis.incr(key)
//   if (requests === 1) {
//     await redis.expire(key, RATE_LIMIT_WINDOW)
//   }
//   return requests <= RATE_LIMIT_MAX
// }

// export async function searchGaragePosts(userInput: string, userIp?: string, cursor?: number) {
//   try {
//     const q = (userInput || "").trim()
//     if (!q) return { posts: [], hasMore: false, nextCursor: null }
//     if (q.length > MAX_QUERY_LENGTH) throw new Error("Search query too long")

//     const identifier = userIp || "global"
//     const allowed = await checkRateLimit(identifier)
//     if (!allowed) throw new Error("Too many searches. Try again in 1 minute.")

//     const keywords = await extractKeywords(q)
//     if (keywords.length === 0) return { posts: [], hasMore: false, nextCursor: null }

//     const searchConditions: Prisma.GaragePostWhereInput[] = keywords.map((keyword) => ({
//       OR: [
//         { title: { contains: keyword, mode: "insensitive" } },
//         { caption: { contains: keyword, mode: "insensitive" } },
//       ],
//     }))

//     const posts = await db.garagePost.findMany({
//       where: {
//         OR: searchConditions,
//         ...(cursor && { id: { lt: cursor } }),
//       },
//       include: {
//         images: { orderBy: { order: "asc" } },
//         makingOf: true,
//         createdBy: {
//           select: {
//             username: true,
//             image: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//       take: 11,
//     })

//     const hasMore = posts.length > 10
//     const data = hasMore ? posts.slice(0, 10) : posts

//     // Follow the exact same pattern as the working implementation
//     const signedPosts = await Promise.all(
//       data.map(async (post) => {
//         // Sign all images URLs
//         const signedImages = await Promise.all(
//           post.images.map(async (image) => {
//             return {
//               id: image.id,
//               url: await signUrl(image.playbackID),
//               order: image.order,
//             }
//           }),
//         )

//         // Sign avatar image URL - same as working implementation
//         const signedAvatar = await signUrl(post.createdBy.image)

//         return {
//           ...post,
//           images: signedImages,
//           createdBy: {
//             ...post.createdBy,
//             image: signedAvatar,
//           },
//         }
//       }),
//     )

//     return {
//       posts: signedPosts,
//       hasMore,
//       nextCursor: hasMore ? signedPosts[signedPosts.length - 1].id : null,
//     }
//   } catch (error) {
//     console.error("[SEARCH ERROR]:", error)
//     return { posts: [], hasMore: false, nextCursor: null }
//   }
// }
"use server"

import { db } from "@/server/db"
import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
import type { Prisma } from "@prisma/client"
import OpenAI from "openai"
import { redis } from "@/utils/redis"
import { auth } from "@/auth"
import { checkUserSubscription } from "@/utils/hassubscription"

const MAX_QUERY_LENGTH = 100
const RATE_LIMIT_WINDOW = 60
const RATE_LIMIT_MAX = 20

const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
}

const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

async function signUrl(keyOrUrl: string | null): Promise<string> {
  if (!keyOrUrl) return PLACEHOLDER_AVATAR
  if (keyOrUrl.startsWith("http")) return keyOrUrl
  const url = `${cloudfrontEnv.cloudfrontUrl}/${keyOrUrl}`
  try {
    return getSignedUrl({
      url,
      keyPairId: cloudfrontEnv.keyPairId,
      privateKey: cloudfrontEnv.privateKey,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
  } catch (error) {
    console.error("Failed to sign URL:", error)
    return PLACEHOLDER_AVATAR
  }
}

function sanitizeTokens(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 1)
  const seen = new Set<string>()
  return tokens.filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
}

async function extractKeywords(userInput: string): Promise<string[]> {
  try {
    const prompt = `Extract the main keywords from this user query for searching a design-related database. Return only a comma-separated list without extra words: ${userInput}`
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precise keyword extractor." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 40,
    })
    const raw = response.choices?.[0]?.message?.content?.trim() || ""
    let parts = raw.split(",").map((k) => k.trim())
    if (parts.length === 1) parts = raw.split(/\s+/).map((k) => k.trim())
    const cleaned = sanitizeTokens(parts.join(" "))
    return cleaned.length > 0 ? cleaned : sanitizeTokens(userInput)
  } catch (err) {
    console.error("[OPENAI ERROR]:", err)
    return sanitizeTokens(userInput)
  }
}

async function checkRateLimit(identifier: string) {
  const key = `search:rate:${identifier}`
  const requests = await redis.incr(key)
  if (requests === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW)
  }
  return requests <= RATE_LIMIT_MAX
}

export async function searchGaragePosts(
  userInput: string,
  userIp?: string,
  cursor?: number
) {
  // 1. Verify authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // 2. Check subscription
  const hasSub = await checkUserSubscription(session.user.id)
  if (!hasSub) {
    throw new Error("Subscription required")
  }

  // 3. Validate input
  const q = (userInput || "").trim()
  if (!q) return { posts: [], hasMore: false, nextCursor: null }
  if (q.length > MAX_QUERY_LENGTH) throw new Error("Search query too long")

  // 4. Rate limit
  const identifier = userIp || session.user.id
  const allowed = await checkRateLimit(identifier)
  if (!allowed) throw new Error("Too many searches. Try again in 1 minute.")

  // 5. Extract keywords
  const keywords = await extractKeywords(q)
  if (keywords.length === 0) return { posts: [], hasMore: false, nextCursor: null }

  // 6. Search DB
  const searchConditions: Prisma.GaragePostWhereInput[] = keywords.map((keyword) => ({
    OR: [
      { title: { contains: keyword, mode: "insensitive" } },
      { caption: { contains: keyword, mode: "insensitive" } },
    ],
  }))

  const posts = await db.garagePost.findMany({
    where: {
      OR: searchConditions,
      ...(cursor && { id: { lt: cursor } }),
    },
    include: {
      images: { orderBy: { order: "asc" } },
      makingOf: true,
      createdBy: {
        select: {
          username: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 11,
  })

  // 7. Paginate & sign URLs
  const hasMore = posts.length > 10
  const data = hasMore ? posts.slice(0, 10) : posts

  const signedPosts = await Promise.all(
    data.map(async (post) => {
      const signedImages = await Promise.all(
        post.images.map(async (image) => ({
          id: image.id,
          url: await signUrl(image.playbackID),
          order: image.order,
        }))
      )

      const signedAvatar = await signUrl(post.createdBy.image)

      return {
        ...post,
        images: signedImages,
        createdBy: {
          ...post.createdBy,
          image: signedAvatar,
        },
      }
    })
  )

  return {
    posts: signedPosts,
    hasMore,
    nextCursor: hasMore ? signedPosts[signedPosts.length - 1].id : null,
  }
}
