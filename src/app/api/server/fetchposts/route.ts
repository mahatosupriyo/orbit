// app/api/server/fetchposts/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { redis } from "@/utils/redis";
import { enforceRateLimit } from "@/utils/rate-limit";
import { generateSignedMuxUrls } from "@/utils/signedmuxurl";
import type { Prisma } from "@prisma/client";

const PAGE_LIMIT = 12;
const MAX_TAKE = 50;
const CACHE_TTL_SECONDS = 60 * 5; // 5 minutes
const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png";

const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL,
};

function hasCloudfrontConfig() {
  return Boolean(cloudfrontEnv.keyPairId && cloudfrontEnv.privateKey && cloudfrontEnv.cloudfrontUrl);
}

/** signs a CloudFront path or returns an absolute URL or placeholder */
async function signUrl(keyOrUrl: string | null): Promise<string> {
  if (!keyOrUrl) return PLACEHOLDER_AVATAR;

  // absolute URL: allow it through (optionally you can add an allowlist)
  if (/^https?:\/\//i.test(keyOrUrl)) return keyOrUrl;

  // if CloudFront configured, sign the resource
  if (hasCloudfrontConfig()) {
    const url = `${cloudfrontEnv.cloudfrontUrl}/${keyOrUrl}`;
    return getSignedUrl({
      url,
      keyPairId: cloudfrontEnv.keyPairId!,
      privateKey: cloudfrontEnv.privateKey!,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h
    });
  }

  // fallback: return composed URL or placeholder
  return cloudfrontEnv.cloudfrontUrl ? `${cloudfrontEnv.cloudfrontUrl}/${keyOrUrl}` : PLACEHOLDER_AVATAR;
}

async function signUrlSafe(keyOrUrl: string | null) {
  try {
    return await signUrl(keyOrUrl);
  } catch (e) {
    console.error("[fetchposts] signUrl failed", e);
    return PLACEHOLDER_AVATAR;
  }
}

function parseCursor(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function securityHeaders(extra?: Record<string, string>) {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "private, max-age=60",
    Vary: "Cookie, Authorization",
    ...(extra ?? {}),
  };
}

async function tryGetCachedResponse(cacheKey: string) {
  try {
    const cached = await redis.get<string>(cacheKey);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (e) {
    return null;
  }
}

async function setCache(cacheKey: string, value: unknown, ttlSeconds: number) {
  try {
    await redis.set(cacheKey, JSON.stringify(value), { ex: ttlSeconds });
  } catch (e) {
    // swallow cache errors
  }
}

/**
 * Prisma type for GaragePost including relations used below
 * - images: Asset[]
 * - makingOf: Asset | null
 * - createdBy: selected fields
 */
type GaragePostWithRelations = Prisma.GaragePostGetPayload<{
  include: {
    images: true;
    makingOf: true;
    createdBy: { select: { id: true; username: true; image: true } };
  };
}>;

export async function GET(req: NextRequest) {
  try {
    // light preflight rate limit
    const pre = await enforceRateLimit({ req, userId: null, windowSeconds: 60, max: 120, namespace: "garage-pre" });
    if (!pre.allowed) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: {
          ...securityHeaders({
            "Retry-After": String(pre.retryAfter ?? 60),
            "X-RateLimit-Limit": String(pre.limit),
            "X-RateLimit-Remaining": String(pre.remaining),
            "X-RateLimit-Reset": String(pre.reset),
          }),
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }

    // auth (optional)
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // user-level rate limit
    const rl = await enforceRateLimit({
      req,
      userId,
      windowSeconds: 60,
      max: userId ? 240 : 60,
      namespace: "garage",
    });

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
      });
    }

    const url = new URL(req.url);
    const cursorRaw = url.searchParams.get("cursor");
    const takeRaw = url.searchParams.get("take");
    const rawTake = Number(takeRaw ?? PAGE_LIMIT);
    const take = Math.max(1, Math.min(rawTake || PAGE_LIMIT, MAX_TAKE));
    const cursor = parseCursor(cursorRaw);

    const cacheKey = `garage:feed:take:${take}:cursor:${cursor ?? "first"}`;
    const cached = await tryGetCachedResponse(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200, headers: securityHeaders() });
    }

    // Build Prisma where - e.g., only show posts from verified creators
    const where: any = { createdBy: { verified: true } };
    if (cursor) {
      // createdAt strictly older than cursor for descending pagination
      where.createdAt = { lt: new Date(cursor) };
    }

    // Fetch with relations
    const rows: GaragePostWithRelations[] = await db.garagePost.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
        createdBy: { select: { id: true, username: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const pageRows = rows.slice(0, take);

    // Sign images & avatars in parallel and prepare response shape
    const signedPosts = await Promise.all(
      pageRows.map(async (post) => {
        // typed asset shape
        const signedImages = await Promise.all(
          post.images.map(async (img: { id: number; playbackID: string; order: number | null }) => {
            return {
              id: img.id,
              url: await signUrlSafe(img.playbackID ?? null),
              order: img.order ?? 0,
            };
          })
        );

        const signedAvatar = await signUrlSafe(post.createdBy?.image ?? null);

        let signedMakingOf: Awaited<ReturnType<typeof generateSignedMuxUrls>> | null = null;
        if (post.makingOf?.playbackID) {
          try {
            signedMakingOf = await generateSignedMuxUrls(post.makingOf.playbackID);
          } catch (e) {
            signedMakingOf = null;
          }
        }

        return {
          id: post.id,
          publicId: (post as any).publicId ?? null, // if you added publicId; else null
          title: post.title,
          caption: post.caption,
          externalUrl: post.externalUrl,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          createdBy: {
            id: post.createdBy.id,
            username: post.createdBy.username,
            image: signedAvatar ?? PLACEHOLDER_AVATAR,
          },
          images: signedImages,
          makingOf: signedMakingOf,
        //   likeCount: post.LikeCount ?? 0,
        };
      })
    );

    const nextCursor = hasMore ? pageRows[pageRows.length - 1].createdAt.toISOString() : null;
    const payload = { posts: signedPosts, nextCursor, hasMore };

    await setCache(cacheKey, payload, CACHE_TTL_SECONDS);
    return NextResponse.json(payload, { status: 200, headers: securityHeaders() });
  } catch (err: any) {
    console.error("[fetchposts] API error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500, headers: securityHeaders() });
  }
}
