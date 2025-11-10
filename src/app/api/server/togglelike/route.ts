import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/auth";
import { redis } from "@/utils/redis";

// rate-limit 1 action per second per user/post
const RATE_LIMIT_SECONDS = 1;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { postId } = await req.json();

    if (!postId || typeof postId !== "number")
      return NextResponse.json({ success: false, message: "Invalid postId" }, { status: 400 });

    // ✅ rate limit (prevents spam clicking)
    if (redis) {
      const key = `like:${userId}:${postId}`;
      const already = await redis.set(key, "1", { nx: true, ex: RATE_LIMIT_SECONDS });
      if (already === null) {
        return NextResponse.json({ success: false, message: "Slow down" }, { status: 429 });
      }
    }

    // ✅ Perform atomic toggle using upsert/delete
    const existing = await db.garagePostLike.findFirst({
      where: { userId, garagePostId: postId },
    });

    if (existing) {
      // Unlike
      await db.garagePostLike.delete({ where: { id: existing.id } });
      const updated = await db.garagePost.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
      return NextResponse.json({ success: true, isLiked: false, likeCount: Math.max(updated.likeCount, 0) });
    }

    // Like
    await db.garagePostLike.create({
      data: { userId, garagePostId: postId },
    });

    const updated = await db.garagePost.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    });

    return NextResponse.json({ success: true, isLiked: true, likeCount: updated.likeCount });

  } catch (err) {
    console.error("togglelike error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
