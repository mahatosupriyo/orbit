import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/auth";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
};

const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png";

async function sign(urlKey: string | null) {
  if (!urlKey) return PLACEHOLDER_AVATAR;
  if (urlKey.startsWith("http")) return urlKey;

  const url = `${cloudfrontEnv.cloudfrontUrl}/${urlKey}`;

  try {
    return getSignedUrl({
      url,
      keyPairId: cloudfrontEnv.keyPairId,
      privateKey: cloudfrontEnv.privateKey,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });
  } catch (err) {
    console.error("CloudFront signing failed:", err);
    return PLACEHOLDER_AVATAR;
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(20, Number(searchParams.get("limit") || 10));

    const maxPosts = userId ? 500 : 100; // free users: 100 posts cap
    const skip = (page - 1) * limit;
    if (skip >= maxPosts) {
      return NextResponse.json({ success: true, posts: [], hasMore: false });
    }

    const posts = await db.garagePost.findMany({
      where: { createdBy: { verified: true } },
      include: {
        images: {
          orderBy: { order: "asc" },
          select: { id: true, playbackID: true, order: true },
        },
        createdBy: { select: { username: true, image: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const signedPosts = await Promise.all(
      posts.map(async (post) => {
        const signedImages = await Promise.all(
          post.images.map(async (img) => ({
            id: img.id,
            url: await sign(img.playbackID),
          }))
        );

        return {
          id: post.id,
          title: post.title,
          caption: post.caption ?? "",
          likeCount: post.likeCount,
          isLiked: !!post.likes?.length, // ✅ correct and null-safe
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
    return NextResponse.json({ success: true, posts: signedPosts, hasMore });
  } catch (err) {
    console.error("fetchposts error:", err);
    return NextResponse.json({ success: false, posts: [], hasMore: false }, { status: 500 });
  }
}
