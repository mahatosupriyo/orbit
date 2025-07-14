// utils/avatarCooldown.ts
import { redis } from "@/utils/redis";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const LOCK_DURATION_MS = 15_000; // 15 seconds

export async function checkAvatarCooldown(userId: string) {
  const key = `user:${userId}:avatar-cooldown`;
  const ttl = await redis.ttl(key);
  if (ttl > 0) {
    const minutes = Math.ceil(ttl / 60);
    throw new Error(`Hold on — ${minutes} minute(s) left.`);
  }
}

export async function setAvatarCooldown(userId: string) {
  const key = `user:${userId}:avatar-cooldown`;
  await redis.set(key, "1", { px: COOLDOWN_MS });
}

export async function acquireAvatarLock(userId: string) {
  const key = `user:${userId}:avatar-lock`;
  const locked = await redis.set(key, "1", { px: LOCK_DURATION_MS, nx: true });
  if (!locked) throw new Error("Another avatar update is in progress.");
  return key;
}

export async function releaseAvatarLock(key: string) {
  await redis.del(key);
}
