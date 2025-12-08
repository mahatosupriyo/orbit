// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/auth";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { redis } from "@/utils/redis";
import { requireSubscription } from "@/utils/requiresubscription"; // adjust path if needed

const CLOUD_FRONT_KEY_PAIR_ID = process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!;
const CLOUD_FRONT_PRIVATE_KEY = (process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const CLOUD_FRONT_URL = process.env.ORBIT_CLOUDFRONT_URL!;
const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png";

const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window
const RATE_LIMIT_MAX = 60; // max requests per window per user
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const PER_PAGE_MAX = 20; // server-side cap
const GLOBAL_MAX_POSTS = 500; // soft global cap so queries don't scan forever

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

async function sign(playbackID: string | null) {
  if (!playbackID) return PLACEHOLDER_AVATAR;
  if (playbackID.startsWith("http")) return playbackID;

  const cacheKey = `cf_signed:${playbackID}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const url = `${CLOUD_FRONT_URL}/${playbackID}`;
    const signed = getSignedUrl({
      url,
      keyPairId: CLOUD_FRONT_KEY_PAIR_ID,
      privateKey: CLOUD_FRONT_PRIVATE_KEY,
      dateLessThan: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString(),
    });

    try {
      await redis.set(cacheKey, signed, { ex: SIGNED_URL_TTL_SECONDS });
    } catch (e) {
      console.warn("redis set failed for signed url:", e);
    }

    return signed;
  } catch (err) {
    console.error("CloudFront signing failed (no sensitive data):", err);
    return PLACEHOLDER_AVATAR;
  }
}

async function rateLimitForUser(userId: string) {
  const key = `rl:user:${userId}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }
    const ttl = await redis.ttl(key);
    return { allowed: current <= RATE_LIMIT_MAX, remaining: Math.max(0, RATE_LIMIT_MAX - current), reset: ttl };
  } catch (err) {
    console.warn("redis rate limit check failed, allowing request:", err);
    return { allowed: true, remaining: RATE_LIMIT_MAX, reset: RATE_LIMIT_WINDOW_SECONDS };
  }
}

export async function GET(req: Request) {
  try {
    // ---------- AUTH (must be authenticated for this endpoint) ----------
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    const userId = String(session.user.id);

    // ---------- RATE LIMIT ----------
    const rl = await rateLimitForUser(userId);
    if (!rl.allowed) {
      return new NextResponse(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rl.reset ?? RATE_LIMIT_WINDOW_SECONDS),
        },
      });
    }

    // ---------- QUERY PARAMS ----------
    const { searchParams } = new URL(req.url);
    const rawPage = Number(searchParams.get("page") ?? 1);
    const rawLimit = Number(searchParams.get("limit") ?? 10);

    const page = Math.max(1, Number.isFinite(rawPage) ? Math.floor(rawPage) : 1);
    const limit = clamp(Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 10, 1, PER_PAGE_MAX);

    const skip = (page - 1) * limit;
    if (skip >= GLOBAL_MAX_POSTS) {
      return NextResponse.json({ success: true, posts: [], hasMore: false, isSubscriber: false });
    }

    // ---------- SUBSCRIPTION CHECK (server-side enforcement) ----------
    // Use requireSubscription util you provided - this confirms auth+subscription
    const sub = await requireSubscription();
    const isSubscriber = !!sub?.ok;

    // If not subscriber and requesting page > 1 -> return empty, hasMore false.
    // This guarantees a non-subscriber cannot fetch beyond first page.
    if (!isSubscriber && page > 1) {
      return NextResponse.json({ success: true, posts: [], hasMore: false, isSubscriber: false });
    }

    // ---------- FETCH POSTS (only allowed fields, safe selection) ----------
    // Avoid heavy includes; only fetch what's needed.
    const [totalCount, posts] = await Promise.all([
      db.garagePost.count({ where: { createdBy: { verified: true } } }),
      db.garagePost.findMany({
        where: { createdBy: { verified: true } },
        include: {
          images: {
            orderBy: { order: "asc" },
            select: { id: true, playbackID: true, order: true },
          },
          createdBy: { select: { username: true, image: true } },
          likes: { where: { userId }, select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // ---------- SIGN URLs in parallel (safe, cached) ----------
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

    // ---------- hasMore calculation (actual DB-driven) ----------
    const delivered = skip + posts.length;
    const cappedTotal = Math.min(totalCount, GLOBAL_MAX_POSTS);
    const hasMore = delivered < cappedTotal;

    // If user is not subscriber, we still allow page 1 but disallow more.
    const effectiveHasMore = isSubscriber ? hasMore : false;

    // ---------- Response ----------
    const res = NextResponse.json(
      { success: true, posts: signedPosts, hasMore: effectiveHasMore, isSubscriber },
      { status: 200 }
    );
    res.headers.set("Cache-Control", "private, max-age=5, s-maxage=5, stale-while-revalidate=30");
    return res;
  } catch (err) {
    console.error("fetchposts error:", err);
    return NextResponse.json({ success: false, posts: [], hasMore: false, error: "Internal server error" }, { status: 500 });
  }
}
