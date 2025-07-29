// app/actions/follow.ts
"use server";

import { db } from "@/server/db";
import { auth } from "@/auth";
import { canFollow } from "./followLimiter";

// Service functions
async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself.");
  }

  return await db.$transaction(async (tx) => {
    // Create follow record
    await tx.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Increment follower count of following user
    await tx.user.update({
      where: { id: followingId },
      data: { followerCount: { increment: 1 } },
    });

    // Increment following count of follower user
    await tx.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    });
  });
}

async function unfollowUser(followerId: string, followingId: string) {
  return await db.$transaction(async (tx) => {
    // Delete follow record
    await tx.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    // Decrement follower count of following user
    await tx.user.update({
      where: { id: followingId },
      data: { followerCount: { decrement: 1 } },
    });

    // Decrement following count of follower user
    await tx.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    });
  });
}

// Server actions used by client components
export async function follow(targetUserId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) throw new Error("Unauthorized");

  const allowed = await canFollow(currentUserId);
  if (!allowed) throw new Error("Too many follow requests");

  await followUser(currentUserId, targetUserId);
}

export async function unfollow(targetUserId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) throw new Error("Unauthorized");

  await unfollowUser(currentUserId, targetUserId);
}
