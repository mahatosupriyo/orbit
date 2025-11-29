// app/api/posts/route.ts  (or wherever your GET handler lives)
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/auth";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { redis } from "@/utils/redis"; // assumed default export Redis client with get/set/incr/expire

const CLOUD_FRONT_KEY_PAIR_ID = process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!;
const CLOUD_FRONT_PRIVATE_KEY = (process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const CLOUD_FRONT_URL = process.env.ORBIT_CLOUDFRONT_URL!;
const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png";

// Rate limit config (tune to your needs)
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window
const RATE_LIMIT_MAX = 60; // max requests per window per user

// Signed URL config
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24 hours - must match dateLessThan below

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

async function sign(playbackID: string | null) {
  if (!playbackID) return PLACEHOLDER_AVATAR;
  if (playbackID.startsWith("http")) return playbackID;

  const cacheKey = `cf_signed:${playbackID}`;

  try {
    // try redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const url = `${CLOUD_FRONT_URL}/${playbackID}`;

    const signed = getSignedUrl({
      url,
      keyPairId: CLOUD_FRONT_KEY_PAIR_ID,
      privateKey: CLOUD_FRONT_PRIVATE_KEY,
      // dateLessThan must be an ISO string
      dateLessThan: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString(),
    });

    // cache the signed url for TTL (so we don't re-sign on every request)
    try {
      // set NX or simple set is OK — if you want to avoid race conditions use SET with NX
      await redis.set(cacheKey, signed, { ex: SIGNED_URL_TTL_SECONDS });
    } catch (e) {
      // don't fail the request if caching fails
      console.warn("redis set failed for signed url:", e);
    }

    return signed;
  } catch (err) {
    console.error("CloudFront signing failed (no sensitive data):", err);
    return PLACEHOLDER_AVATAR;
  }
}

async function rateLimitForUser(userId: string) {
  // Use a per-user key. If you have a distributed Redis, INCR + EXPIRE is fine.
  const key = `rl:user:${userId}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      // first hit in window -> set expiry
      await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }
    const ttl = await redis.ttl(key);
    return { allowed: current <= RATE_LIMIT_MAX, remaining: Math.max(0, RATE_LIMIT_MAX - current), reset: ttl };
  } catch (err) {
    // On Redis failure, fail-open (allow request) but log.
    console.warn("redis rate limit check failed, allowing request:", err);
    return { allowed: true, remaining: RATE_LIMIT_MAX, reset: RATE_LIMIT_WINDOW_SECONDS };
  }
}

export async function GET(req: Request) {
  try {
    // 1) Enforce auth for every call
    const session = await auth();
    const user = session?.user;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    const userId = String(user.id);

    // 2) Rate limiting per user
    const rl = await rateLimitForUser(userId);
    if (!rl.allowed) {
      // set Retry-After header to the TTL Redis returned (seconds)
      return new NextResponse(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rl.reset ?? RATE_LIMIT_WINDOW_SECONDS),
        },
      });
    }

    // 3) Parse & validate query params (stronger validation)
    const { searchParams } = new URL(req.url);
    const rawPage = Number(searchParams.get("page") ?? 1);
    const rawLimit = Number(searchParams.get("limit") ?? 10);

    const page = Math.max(1, Number.isFinite(rawPage) ? Math.floor(rawPage) : 1);
    // enforce per-page max 20 and minimum 1
    const limit = clamp(Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 10, 1, 20);

    const maxPosts = 500; // since only authenticated users can access, give full cap (tweak as needed)
    const skip = (page - 1) * limit;
    if (skip >= maxPosts) {
      return NextResponse.json({ success: true, posts: [], hasMore: false });
    }

    // 4) Query only allowed fields and avoid sending anything sensitive
    const posts = await db.garagePost.findMany({
      where: { createdBy: { verified: true } },
      include: {
        images: {
          orderBy: { order: "asc" },
          select: { id: true, playbackID: true, order: true },
        },
        createdBy: { select: { username: true, image: true } },
        // determine whether this user liked the post; avoids leaking who else liked
        likes: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // 5) Sign and cache image URLs in parallel
    const signedPosts = await Promise.all(
      posts.map(async (post) => {
        const signedImages = await Promise.all(
          post.images.map(async (img) => ({
            id: img.id,
            url: await sign(img.playbackID),
            order: img.order,
          }))
        );

        return {
          id: post.id,
          title: post.title,
          caption: post.caption ?? "",
          likeCount: post.likeCount ?? 0,
          isLiked: !!post.likes?.length,
          createdAt: post.createdAt,
          createdBy: {
            username: post.createdBy.username,
            image: await sign(post.createdBy.image),
          },
          images: signedImages,
        };
      })
    );

    const hasMore = skip + posts.length < maxPosts;
    // set some helpful response headers (cache-control depends on how dynamic your content is)
    const res = NextResponse.json({ success: true, posts: signedPosts, hasMore }, { status: 200 });
    // You can tune caching: short cache to reduce DB reads (if posts are not realtime for your app).
    res.headers.set("Cache-Control", "private, max-age=5, s-maxage=5, stale-while-revalidate=30");
    return res;
  } catch (err) {
    // Don't leak internal error details in production - log them server-side.
    console.error("fetchposts error:", err);
    return NextResponse.json({ success: false, posts: [], hasMore: false, error: "Internal server error" }, { status: 500 });
  }
}
