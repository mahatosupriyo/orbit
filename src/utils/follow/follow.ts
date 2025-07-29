// // app/actions/follow.ts
// "use server";

// import { db } from "@/server/db";
// import { auth } from "@/auth";
// import { canFollow } from "./followLimiter";

// // Internal Service Functions
// async function followUser(followerId: string, followingId: string) {
//   if (followerId === followingId) {
//     throw new Error("You cannot follow yourself.");
//   }

//   return await db.$transaction(async (tx) => {
//     await tx.follow.create({
//       data: {
//         followerId,
//         followingId,
//       },
//     });

//     await tx.user.update({
//       where: { id: followingId },
//       data: { followerCount: { increment: 1 } },
//     });

//     await tx.user.update({
//       where: { id: followerId },
//       data: { followingCount: { increment: 1 } },
//     });
//   });
// }

// async function unfollowUser(followerId: string, followingId: string) {
//   return await db.$transaction(async (tx) => {
//     await tx.follow.delete({
//       where: {
//         followerId_followingId: {
//           followerId,
//           followingId,
//         },
//       },
//     });

//     await tx.user.update({
//       where: { id: followingId },
//       data: { followerCount: { decrement: 1 } },
//     });

//     await tx.user.update({
//       where: { id: followerId },
//       data: { followingCount: { decrement: 1 } },
//     });
//   });
// }

// // Server Actions
// export async function follow(targetUserId: string) {
//   const session = await auth();
//   const currentUserId = session?.user?.id;

//   if (!currentUserId) {
//     throw new Error("Unauthorized request.");
//   }

//   const allowed = await canFollow(currentUserId);
//   if (!allowed) {
//     throw new Error("Too many follow requests. Try again later.");
//   }

//   await followUser(currentUserId, targetUserId);
// }

// export async function unfollow(targetUserId: string) {
//   const session = await auth();
//   const currentUserId = session?.user?.id;

//   if (!currentUserId) {
//     throw new Error("Unauthorized request.");
//   }

//   await unfollowUser(currentUserId, targetUserId);
// }


"use server";

import { db } from "@/server/db";
import { auth } from "@/auth";
import { canFollow } from "./followLimiter";

async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself.");
  }

  return await db.$transaction(async (tx) => {
    await tx.follow.create({
      data: { followerId, followingId },
    });

    await tx.user.update({
      where: { id: followingId },
      data: { followerCount: { increment: 1 } },
    });

    await tx.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    });
  });
}

async function unfollowUser(followerId: string, followingId: string) {
  return await db.$transaction(async (tx) => {
    await tx.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    await tx.user.update({
      where: { id: followingId },
      data: { followerCount: { decrement: 1 } },
    });

    await tx.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    });
  });
}

export async function follow(targetUserId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) throw new Error("Unauthorized");

  const allowed = await canFollow(currentUserId);
  if (!allowed) throw new Error("Suspicious activity detected, try later");

  await followUser(currentUserId, targetUserId);
}

export async function unfollow(targetUserId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) throw new Error("Unauthorized");

  await unfollowUser(currentUserId, targetUserId);
}
