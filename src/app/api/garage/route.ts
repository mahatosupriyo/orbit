
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/server/db"
import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
import { checkUserSubscription } from "@/utils/hassubscription"
import { redis } from "@/utils/redis"
import { enforceRateLimit } from "@/utils/rate-limit"
import { generateSignedMuxUrls } from "@/utils/signedmuxurl"

// Constants
const FREE_POSTS_LIMIT = 10 // Free users see only 10 posts total
const PAGE_LIMIT = 10 // Number of posts per page for subscribed users
const MAX_TAKE = PAGE_LIMIT
const CACHE_TTL_SECONDS = 300 // 5 minutes cache
const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png"

// Security: Ensure envs exist
const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL,
}

function assertEnv() {
  if (!cloudfrontEnv.keyPairId || !cloudfrontEnv.privateKey || !cloudfrontEnv.cloudfrontUrl) {
    throw new Error("Missing CloudFront signing environment variables")
  }
}

// Allowlist for http(s) avatars or image URLs
const ALLOWED_ABSOLUTE_URL_PREFIXES = [process.env.ORBIT_CLOUDFRONT_URL ?? ""]

// Sign CloudFront resource
async function signUrl(keyOrUrl: string | null): Promise<string> {
  assertEnv()
  if (!keyOrUrl) return PLACEHOLDER_AVATAR

  if (/^https?:\/\//i.test(keyOrUrl)) {
    const isAllowed = ALLOWED_ABSOLUTE_URL_PREFIXES.some((p) => p && keyOrUrl.startsWith(p))
    return isAllowed ? keyOrUrl : PLACEHOLDER_AVATAR
  }

  const url = `${cloudfrontEnv.cloudfrontUrl}/${keyOrUrl}`
  return getSignedUrl({
    url,
    keyPairId: cloudfrontEnv.keyPairId!,
    privateKey: cloudfrontEnv.privateKey!,
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h
  })
}

// Parse cursor
function parseCursor(value: string | null): number | null {
  if (!value) return null
  if (!/^\d+$/.test(value)) return null
  const n = Number(value)
  if (!Number.isSafeInteger(n) || n <= 0) return null
  return n
}

// Security headers
function securityHeaders(extra?: Record<string, string>) {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "private, max-age=60",
    Vary: "Cookie, Authorization",
    ...(extra || {}),
  }
}

// Redis cache helpers
async function tryGetCachedResponse(cacheKey: string) {
  const cached = await redis.get<string>(cacheKey)
  if (!cached) return null
  try { return JSON.parse(cached) } catch { return null }
}

async function setCache(cacheKey: string, value: unknown, ttlSeconds: number) {
  try { await redis.set(cacheKey, JSON.stringify(value), { ex: ttlSeconds }) } catch {}
}

// GET handler
export async function GET(req: NextRequest) {
  try {
    // Generic preflight rate limit
    const preflight = await enforceRateLimit({ req, userId: null, windowSeconds: 60, max: 60, namespace: "garage-pre" })
    if (!preflight.allowed) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: { 
          ...securityHeaders({
            "Retry-After": String(preflight.retryAfter ?? 60),
            "X-RateLimit-Limit": String(preflight.limit),
            "X-RateLimit-Remaining": String(preflight.remaining),
            "X-RateLimit-Reset": String(preflight.reset),
          }),
          "Content-Type": "application/json; charset=utf-8",
        },
      })
    }

    // Auth & subscription
    const session = await auth()
    const userId = session?.user?.id ?? null
    const isSubscribed = userId ? await checkUserSubscription(userId) : false

    // User-level rate limit
    const rl = await enforceRateLimit({
      req, userId, windowSeconds: 60,
      max: isSubscribed ? 120 : 40,
      namespace: "garage",
    })
    if (!rl.allowed) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: {
          ...securityHeaders({
            "Retry-After": String(rl.retryAfter ?? 60),
            "X-RateLimit-Limit": String(rl.limit),
            "X-RateLimit-Remaining": String(rl.remaining),
            "X-RateLimit-Reset": String(rl.reset),
          }),
          "Content-Type": "application/json; charset=utf-8",
        },
      })
    }

    const { searchParams } = new URL(req.url)
    const cursorRaw = searchParams.get("cursor")
    const cursor = parseCursor(cursorRaw)

    // For free users: ignore pagination, always return first 10 posts
    if (!isSubscribed) {
      const freeCacheKey = "garage:feed:free:first"
      const cached = await tryGetCachedResponse(freeCacheKey)
      if (cached) return NextResponse.json(cached, { status: 200, headers: securityHeaders() })

      const freePosts = await db.garagePost.findMany({
        where: { createdBy: { verified: true } },
        include: {
          images: { orderBy: { order: "asc" } },
          makingOf: true,
          createdBy: { select: { username: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: FREE_POSTS_LIMIT,
      })

      const signedPosts = await Promise.all(freePosts.map(async (post) => {
        const signedImages = await Promise.all(post.images.map(async (img) => ({
          id: img.id,
          url: await signUrl(img.playbackID),
          order: img.order,
        })))
        const signedAvatar = await signUrl(post.createdBy.image)

        // sign makingOf video if present
        let signedMakingOf = null
        if (post.makingOf?.playbackID) {
          signedMakingOf = await generateSignedMuxUrls(post.makingOf.playbackID)
        }

        return {
          ...post,
          createdAt: post.createdAt.toISOString(),
          images: signedImages,
          createdBy: { ...post.createdBy, image: signedAvatar },
          makingOf: signedMakingOf,
        }
      }))

      const payload = { posts: signedPosts, isSubscribed, nextCursor: null, hasMore: false }
      await setCache(freeCacheKey, payload, CACHE_TTL_SECONDS)
      return NextResponse.json(payload, { status: 200, headers: securityHeaders() })
    }

    // For subscribed users: normal paginated logic
    const take = Math.min(PAGE_LIMIT, MAX_TAKE)
    const cacheKey = `garage:feed:pro:${cursor ?? "first"}`
    const cached = await tryGetCachedResponse(cacheKey)
    if (cached) return NextResponse.json(cached, { status: 200, headers: securityHeaders() })

    const posts = await db.garagePost.findMany({
      where: { createdBy: { verified: true } },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
        createdBy: { select: { username: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    const hasMore = posts.length > take
    const sliced = posts.slice(0, take)

    const signedPosts = await Promise.all(sliced.map(async (post) => {
      const signedImages = await Promise.all(post.images.map(async (img) => ({
        id: img.id,
        url: await signUrl(img.playbackID),
        order: img.order,
      })))
      const signedAvatar = await signUrl(post.createdBy.image)

      // sign makingOf video if present
      let signedMakingOf = null
      if (post.makingOf?.playbackID) {
        signedMakingOf = await generateSignedMuxUrls(post.makingOf.playbackID)
      }

      return {
        ...post,
        createdAt: post.createdAt.toISOString(),
        images: signedImages,
        createdBy: { ...post.createdBy, image: signedAvatar },
        makingOf: signedMakingOf,
      }
    }))

    const payload = { posts: signedPosts, isSubscribed, nextCursor: hasMore ? sliced[sliced.length - 1].id : null, hasMore }
    await setCache(cacheKey, payload, CACHE_TTL_SECONDS)
    return NextResponse.json(payload, { status: 200, headers: securityHeaders() })

  } catch (err) {
    console.error("[garage] API error:", (err as Error)?.message)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500, headers: securityHeaders() })
  }
}
