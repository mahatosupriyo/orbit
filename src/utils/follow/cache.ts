// utils/follow/cache.ts
import { redis } from "@/utils/redis";

export async function setFollowCache(userId: string, targetUserId: string) {
  await redis.set(`follow:${userId}->${targetUserId}`, "1");
}

export async function unsetFollowCache(userId: string, targetUserId: string) {
  await redis.del(`follow:${userId}->${targetUserId}`);
}

export async function isFollowingCached(userId: string, targetUserId: string) {
  return await redis.get(`follow:${userId}->${targetUserId}`) === "1";
}
