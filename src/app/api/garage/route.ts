// app/api/garage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { checkUserSubscription } from "@/utils/hassubscription";

const FREE_POSTS_LIMIT = 10; // Free users see only 10 posts per scroll
const SUBSCRIBED_POSTS_LIMIT = 10; // Subscribed users fetch 10 per scroll (infinite scroll)
const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png";

const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
};

async function signUrl(keyOrUrl: string | null): Promise<string> {
  if (!keyOrUrl) return PLACEHOLDER_AVATAR;
  if (keyOrUrl.startsWith("http")) return keyOrUrl;

  const url = `${cloudfrontEnv.cloudfrontUrl}/${keyOrUrl}`;
  return getSignedUrl({
    url,
    keyPairId: cloudfrontEnv.keyPairId,
    privateKey: cloudfrontEnv.privateKey,
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  });
}

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get logged-in user
    const session = await auth();
    const userId = session?.user?.id;

    // 2️⃣ Check subscription
    const isSubscribed = userId ? await checkUserSubscription(userId) : false;

    // 3️⃣ Decide how many posts per request
    const POSTS_PER_PAGE = isSubscribed ? SUBSCRIBED_POSTS_LIMIT : FREE_POSTS_LIMIT;

    // 4️⃣ Get cursor from query
    const { searchParams } = new URL(req.url);
    const cursorId = searchParams.get("cursor"); // last post ID from previous page

    // 5️⃣ Fetch posts
    const posts = await db.garagePost.findMany({
      where: { createdBy: { verified: true } },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
        createdBy: { select: { username: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: POSTS_PER_PAGE + 1, // fetch one extra to check if more posts exist
      ...(cursorId ? { skip: 1, cursor: { id: Number(cursorId) } } : {}),
    });

    // 6️⃣ Determine if more posts exist
    const hasMore = posts.length > POSTS_PER_PAGE;
    const sliced = posts.slice(0, POSTS_PER_PAGE);

    // 7️⃣ Sign images and avatars
    const signedPosts = await Promise.all(
      sliced.map(async (post) => {
        const signedImages = await Promise.all(
          post.images.map(async (img) => ({
            id: img.id,
            url: await signUrl(img.playbackID),
            order: img.order,
          }))
        );
        const signedAvatar = await signUrl(post.createdBy.image);

        return {
          ...post,
          createdAt: post.createdAt.toISOString(),
          images: signedImages,
          createdBy: { ...post.createdBy, image: signedAvatar },
        };
      })
    );

    // 8️⃣ Return response
    return NextResponse.json({
      posts: signedPosts,
      isSubscribed,
      nextCursor: hasMore ? sliced[sliced.length - 1].id : null,
      hasMore,
    });
  } catch (err) {
    console.error("Garage API error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
