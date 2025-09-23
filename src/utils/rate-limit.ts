import type { NextRequest } from "next/server"
import { redis } from "./redis"

export type RateLimitInfo = {
  allowed: boolean
  limit: number
  remaining: number
  reset: number // unix seconds when window resets
  retryAfter?: number // seconds until reset
  key: string
}

function getClientIP(req: NextRequest): string {
  // prioritize standard proxy headers
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  const xri = req.headers.get("x-real-ip")
  if (xri) return xri
  // fallback to connection info (not always available in Next.js)
  return "unknown"
}

export function requesterKey(req: NextRequest, userId?: string | null): string {
  // Prefer stable user-based key if logged in, otherwise IP
  if (userId) return `user:${userId}`
  const ip = getClientIP(req)
  return `ip:${ip}`
}

export async function enforceRateLimit(opts: {
  req: NextRequest
  userId?: string | null
  // window in seconds
  windowSeconds: number
  // max allowed within the window
  max: number
  // optional namespace
  namespace?: string
}): Promise<RateLimitInfo> {
  const { req, userId, windowSeconds, max, namespace = "garage" } = opts

  const nowSec = Math.floor(Date.now() / 1000)
  const windowId = Math.floor(nowSec / windowSeconds)
  const keyBase = requesterKey(req, userId)
  const key = `ratelimit:${namespace}:${keyBase}:${windowId}`

  // Increment the counter and set the TTL if first hit in window
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, windowSeconds)
  }

  const remaining = Math.max(0, max - count)
  const reset = (windowId + 1) * windowSeconds
  const allowed = count <= max

  const info: RateLimitInfo = {
    allowed,
    limit: max,
    remaining,
    reset,
    key,
  }

  if (!allowed) {
    info.retryAfter = reset - nowSec
  }

  return info
}
