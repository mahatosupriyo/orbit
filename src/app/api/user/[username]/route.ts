// src/app/api/user/[username]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { auth } from "@/auth";
import { generateSignedMuxUrls } from "@/utils/signedmuxurl";

const { ORBIT_CLOUDFRONT_KEY_PAIR_ID, ORBIT_CLOUDFRONT_PRIVATE_KEY, ORBIT_CLOUDFRONT_URL } = process.env;

const cloudfrontEnv = {
  keyPairId: ORBIT_CLOUDFRONT_KEY_PAIR_ID ?? "",
  privateKey: (ORBIT_CLOUDFRONT_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  cloudfrontUrl: ORBIT_CLOUDFRONT_URL ?? "",
};

// NOTE: params is a Promise in Next.js v15+; type it accordingly and await.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> } // <-- important: Promise<{ username: string }>
) {
  try {
    const { username } = await params; // await the params promise

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (!username) {
      return NextResponse.json({ message: "Missing username" }, { status: 400 });
    }

    // ... rest of your code unchanged (use `username` variable here)
    const user = await db.user.findUnique({
      where: { username },
      select: { id: true, username: true, name: true, image: true },
    });

    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const posts = await db.garagePost.findMany({
      where: { createdById: user.id },
      include: {
        images: { orderBy: { order: "asc" } },
        makingOf: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const postsWithSignedUrls = await Promise.all(
      posts.map(async (post) => {
        const signedImages = await Promise.all(
          post.images.map(async (image) => {
            if (!image.playbackID) return null;
            const url = `${cloudfrontEnv.cloudfrontUrl.replace(/\/$/, "")}/${image.playbackID}`;
            try {
              const signedUrl = getSignedUrl({
                url,
                keyPairId: cloudfrontEnv.keyPairId,
                privateKey: cloudfrontEnv.privateKey,
                dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
              });
              return { id: image.id, url: signedUrl, order: image.order };
            } catch (err) {
              console.error(`Error signing image URL for image ${image.id}:`, err);
              return null;
            }
          })
        );

        const validImages = signedImages.filter(Boolean) as Array<{
          id: number;
          url: string;
          order: number | null;
        }>;

        const mux = post.makingOf?.playbackID
          ? await generateSignedMuxUrls(post.makingOf.playbackID)
          : null;

        return {
          id: post.id,
          title: post.title,
          caption: post.caption,
          externalUrl: post.externalUrl,
          createdAt: post.createdAt.toISOString(),
          images: validImages,
          makingOf: post.makingOf
            ? { id: post.makingOf.id, playbackID: post.makingOf.playbackID }
            : null,
          signedMux: mux,
        };
      })
    );

    return NextResponse.json({ user, posts: postsWithSignedUrls }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/user/[username]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
