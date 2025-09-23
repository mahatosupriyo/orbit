import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { checkUserSubscription } from "@/utils/hassubscription";

const FREE_POSTS_LIMIT = 10;
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
    // ✅ Get logged-in user
    const session = await auth();
    const userId = session?.user?.id;

    // 1️⃣ Check subscription first
    const isSubscribed = userId ? await checkUserSubscription(userId) : false;

    // 2️⃣ Decide number of posts to fetch
    const take = isSubscribed ? undefined : FREE_POSTS_LIMIT;

    // 3️⃣ Fetch posts
    const posts = await db.garagePost.findMany({
      where: { createdBy: { verified: true } },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
        createdBy: { select: { username: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
    });

    // 4️⃣ Sign URLs
    const signedPosts = await Promise.all(
      posts.map(async (post) => {
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

    return NextResponse.json({
      posts: signedPosts,
      isSubscribed,
      hasMore: false, // fetch all for subscribed, limited for free
    });
  } catch (err) {
    console.error("Garage API error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
