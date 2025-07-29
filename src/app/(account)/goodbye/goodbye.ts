"use server";

import { db } from "@/server/db";
import { auth } from "@/auth";
import {
    S3Client,
    DeleteObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.ORBIT_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.ORBIT_S3_BUCKET_NAME!;

async function deleteS3Folder(prefix: string) {
    try {
        const listedObjects = await s3.send(
            new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
        );

        if (!listedObjects.Contents?.length) return;

        const deleteParams = {
            Bucket: BUCKET,
            Delete: {
                Objects: listedObjects.Contents.map(({ Key }) => ({ Key: Key! })),
                Quiet: true,
            },
        };

        await s3.send(new DeleteObjectsCommand(deleteParams));
    } catch (error) {
        console.error("S3 folder deletion error:", prefix, error);
    }
}

export async function deleteAccount() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return { success: false, message: "You must be logged in." };

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                garagePosts: { include: { images: true } },
                courses: { include: { lessons: { include: { video: true } } } },
            },
        });

        if (!user) return { success: false, message: "User not found." };

        // Delete avatar from S3 if custom
        if (
            user.image &&
            !user.image.startsWith("http") &&
            user.image !== "defaultavatar.png"
        ) {
            try {
                await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: user.image }));
            } catch (err) {
                console.warn("Failed to delete avatar from S3:", err);
            }
        }

        // Delete GaragePosts and related assets
        for (const post of user.garagePosts) {
            await deleteS3Folder(`garage/${userId}/${post.id}/images/`);
            for (const asset of post.images) {
                if (asset.playbackID) {
                    try {
                        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: asset.playbackID }));
                    } catch {}
                    await db.asset.delete({ where: { id: asset.id } }).catch(() => {});
                }
            }

            if (post.assetId) {
                const makingOfAsset = await db.asset.findUnique({ where: { id: post.assetId } });
                if (makingOfAsset?.playbackID) {
                    try {
                        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: makingOfAsset.playbackID }));
                    } catch {}
                    await db.asset.delete({ where: { id: post.assetId } }).catch(() => {});
                }
            }

            await db.garagePost.delete({ where: { id: post.id } }).catch(() => {});
        }

        // Delete Courses, Lessons, and video assets
        for (const course of user.courses) {
            for (const lesson of course.lessons) {
                if (lesson.video?.playbackID) {
                    try {
                        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: lesson.video.playbackID }));
                    } catch {}
                    await db.asset.delete({ where: { id: lesson.video.id } }).catch(() => {});
                }
            }

            await db.lesson.deleteMany({ where: { courseId: course.id } }).catch(() => {});
            await db.course.delete({ where: { id: course.id } }).catch(() => {});
        }

        // Delete Posts
        await db.post.deleteMany({ where: { createdById: userId } }).catch(() => {});

        // Delete Payments
        await db.payment.deleteMany({ where: { userId } }).catch(() => {});

        // Delete Follows
        await db.follow.deleteMany({ where: { followerId: userId } }).catch(() => {});
        await db.follow.deleteMany({ where: { followingId: userId } }).catch(() => {});

        // Delete Verification Tokens
        await db.verificationToken.deleteMany({ where: { identifier: user.email ?? "" } }).catch(() => {});

        // Wipe sensitive user fields (optional defense-in-depth)
        await db.user.update({
            where: { id: userId },
            data: {
                email: null,
                username: null,
                image: null,
            },
        });

        // Delete orphaned assets by user prefix
        await deleteS3Folder(`garage/${userId}/`);
        await deleteS3Folder(`avatar/${userId}/`);

        // Final user deletion (cascades to sessions, accounts, etc.)
        await db.user.delete({ where: { id: userId } });

        return { success: true, message: "Account deleted successfully." };
    } catch (err: any) {
        console.error("Account deletion failed:", err.message, err.stack);
        return { success: false, message: "Failed to delete account." };
    }
}
