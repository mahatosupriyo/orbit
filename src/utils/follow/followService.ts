import { db } from "@/server/db";
import { redis } from "../redis";

const FOLLOW_LIMIT = 10;
const WINDOW = 60; // seconds (1 minute)

export async function canFollow(userId: string): Promise<boolean> {
  const key = `follow-rate:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW);
  return count <= FOLLOW_LIMIT;
}

export async function followUser(followerId: string, followingId: string, followerName?: string) {
  // Optional: Remove rate-limit check here if already done in server action

  try {
    await db.$transaction(async (tx) => {
      // Create follow record
      await tx.follow.create({
        data: { followerId, followingId },
      });

      // Increment follower/following counts in DB to keep source of truth accurate
      await tx.user.update({
        where: { id: followingId },
        data: { followerCount: { increment: 1 } },
      });
      await tx.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      });
    });

    // Update Redis counters after transaction success
    await redis.incr(`user:${followerId}:following`);
    await redis.incr(`user:${followingId}:followers`);
  } catch (error: any) {
    // Optional: handle duplicate follow error gracefully if you want
    if (error.code === 'P2002') {
      // Unique constraint violation - already following
      return;
    }
    throw error;
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  await db.$transaction(async (tx) => {
    // Delete follow record
    await tx.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });

    // Decrement counts in DB
    await tx.user.update({
      where: { id: followingId },
      data: { followerCount: { decrement: 1 } },
    });
    await tx.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    });
  });

  await redis.decr(`user:${followerId}:following`);
  await redis.decr(`user:${followingId}:followers`);
}
