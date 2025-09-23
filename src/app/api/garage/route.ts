import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/server/db"
import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
import { checkUserSubscription } from "@/utils/hassubscription"
import { redis } from "@/utils/redis"
import { enforceRateLimit } from "@/utils/rate-limit"

// Constants
const FREE_POSTS_LIMIT = 10 // free users see only 10 posts
const PAGE_LIMIT = 20 // number of posts per page for subscribed users
const MAX_TAKE = PAGE_LIMIT // hard ceiling to avoid unexpected large queries
const CACHE_TTL_SECONDS = 300 // 5 minutes cache to avoid hot-spot load
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

// Allowlist for http(s) avatars or image URLs if already absolute.
// If a URL is not in this list, we fall back to a placeholder to avoid SSRF/leaks.
const ALLOWED_ABSOLUTE_URL_PREFIXES = [
  // your CDN origin
  process.env.ORBIT_CLOUDFRONT_URL ?? "",
  // add any explicitly trusted domains if required
]

// Guard and sign CloudFront resource
async function signUrl(keyOrUrl: string | null): Promise<string> {
  assertEnv()

  if (!keyOrUrl) return PLACEHOLDER_AVATAR

  // Allow only known-safe absolute URLs; otherwise treat as key for CloudFront
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

// Validate and normalize cursor
function parseCursor(value: string | null): number | null {
  if (!value) return null
  // Only allow positive integers
  if (!/^\d+$/.test(value)) return null
  const n = Number(value)
  if (!Number.isSafeInteger(n) || n <= 0) return null
  return n
}

// Build consistent security headers
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

// Read from cache if available
async function tryGetCachedResponse(cacheKey: string) {
  const cached = await redis.get<string>(cacheKey)
  if (!cached) return null
  try {
    return JSON.parse(cached)
  } catch {
    return null
  }
}

async function setCache(cacheKey: string, value: unknown, ttlSeconds: number) {
  try {
    await redis.set(cacheKey, JSON.stringify(value), { ex: ttlSeconds })
  } catch {
    // best effort; ignore cache set errors
  }
}

export async function GET(req: NextRequest) {
  try {
    // Early generic rate limit (before any DB work)
    const preflight = await enforceRateLimit({
      req,
      userId: null,
      windowSeconds: 60,
      max: 60, // 60 req/min per IP for generic preflight
      namespace: "garage-pre",
    })

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

    // Auth and subscription
    const session = await auth()
    const userId = session?.user?.id ?? null
    const isSubscribed = userId ? await checkUserSubscription(userId) : false

    // Apply user-level rate limiting (subscribers get higher allowance)
    const rl = await enforceRateLimit({
      req,
      userId,
      windowSeconds: 60,
      max: isSubscribed ? 120 : 40, // tighter for free users
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

    const takeUnbounded = isSubscribed ? PAGE_LIMIT : FREE_POSTS_LIMIT
    const take = Math.min(takeUnbounded, MAX_TAKE)

    // Cache key varies by subscription and cursor
    const cacheKey = `garage:feed:${isSubscribed ? "pro" : "free"}:${cursor ?? "first"}`

    // Attempt cache read
    const cached = await tryGetCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: securityHeaders({
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": String(rl.remaining),
          "X-RateLimit-Reset": String(rl.reset),
        }),
      })
    }

    // Query posts
    const posts = await db.garagePost.findMany({
      where: { createdBy: { verified: true } },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
        createdBy: { select: { username: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: take + 1, // fetch extra to check if more pages exist
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    const hasMore = posts.length > take
    const sliced = posts.slice(0, take)

    // Sign URLs safely
    const signedPosts = await Promise.all(
      sliced.map(async (post: any) => {
        const signedImages = await Promise.all(
          post.images.map(async (img: any) => ({
            id: img.id,
            url: await signUrl(img.playbackID),
            order: img.order,
          })),
        )
        const signedAvatar = await signUrl(post.createdBy.image)

        return {
          ...post,
          createdAt: post.createdAt.toISOString(),
          images: signedImages,
          createdBy: { ...post.createdBy, image: signedAvatar },
        }
      }),
    )

    const payload = {
      posts: signedPosts,
      isSubscribed,
      nextCursor: hasMore ? sliced[sliced.length - 1].id : null,
      hasMore,
    }

    // Cache the payload for a short duration
    await setCache(cacheKey, payload, CACHE_TTL_SECONDS)

    return NextResponse.json(payload, {
      status: 200,
      headers: securityHeaders({
        "X-RateLimit-Limit": String(rl.limit),
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(rl.reset),
      }),
    })
  } catch (err) {
    // Avoid leaking internals
    console.error("[garage] API error:", (err as Error)?.message)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500, headers: securityHeaders() })
  }
}
