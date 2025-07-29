// utils/rate-limit/followLimiter.ts
import { redis } from "@/utils/redis";

export async function canFollow(userId: string): Promise<boolean> {
    const key = `rate_limit:follow:${userId}`;
    const limit = 5; // Max 5 follows per minute
    const ttl = 60;

    const tx = redis.multi();
    tx.incr(key);
    tx.expire(key, ttl);
    const [count] = await tx.exec();

    return (Number(count) <= limit);
}
