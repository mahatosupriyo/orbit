import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/auth";
import { redis } from "@/utils/redis"; // <- your existing upstash instance

const RATE_LIMIT_SECONDS = 1;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 50;

function isTransient(err: any) {
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("deadlock") ||
    msg.includes("serialization") ||
    msg.includes("could not obtain lock") ||
    msg.includes("timeout")
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { postId } = await req.json().catch(() => ({ postId: null }));
  if (!postId || typeof postId !== "number")
    return NextResponse.json({ success: false, message: "Invalid postId" }, { status: 400 });

  // ✅ Upstash Redis rate-limit
  if (redis) {
    const key = `like:${userId}:${postId}`;
    const set = await redis.set(key, "1", { nx: true, ex: RATE_LIMIT_SECONDS });
    if (set === null) {
      return NextResponse.json({ success: false, message: "Try again..." }, { status: 429 });
    }
  }

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const result = await db.$transaction(async (tx) => {
        // ✅ Advisory lock to prevent race conditions
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BigInt(postId)});`;

        const post = await tx.garagePost.findUnique({
          where: { id: postId },
          select: { id: true, likeCount: true },
        });

        if (!post) throw new Error("Post not found");

        const existing = await tx.garagePostLike.findFirst({
          where: { userId, garagePostId: postId },
          select: { id: true },
        });

        if (existing) {
          // ✅ Unlike
          await tx.garagePostLike.delete({ where: { id: existing.id } });
          const updated = await tx.garagePost.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } },
            select: { likeCount: true }
          });
          return { isLiked: false, likeCount: Math.max(0, updated.likeCount) };
        }

        // ✅ Like
        await tx.garagePostLike.create({
          data: { userId, garagePostId: postId },
        });

        const updated = await tx.garagePost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true }
        });

        return { isLiked: true, likeCount: updated.likeCount };
      });

      return NextResponse.json({ success: true, ...result });
    } catch (err) {
      if (isTransient(err) && attempt < MAX_RETRIES) {
        const back = RETRY_BASE_MS * attempt + Math.random() * 30;
        await new Promise((r) => setTimeout(r, back));
        continue;
      }
      console.error("toggle-like error:", err);
      return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
  }
}
