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
                garagePosts: {
                    include: {
                        images: true, // Include images assets
                    },
                },
                courses: {
                    include: {
                        lessons: {
                            include: { video: true },
                        },
                    },
                },
            },
        });

        if (!user) return { success: false, message: "User not found." };

        // Delete avatar from S3 if internal custom
        if (
            user.image &&
            !user.image.startsWith("http") &&
            user.image !== "defaultavatar.png"
        ) {
            try {
                await s3.send(
                    new DeleteObjectCommand({
                        Bucket: BUCKET,
                        Key: user.image,
                    })
                );
            } catch (err) {
                console.warn("Failed to delete avatar from S3:", err);
            }
        }

        // Delete GaragePosts images and assets
        for (const post of user.garagePosts) {
            try {
                // Delete S3 images folder for this post
                await deleteS3Folder(`garage/${userId}/${post.id}/images/`);

                // Delete each image asset related to this GaragePost
                for (const asset of post.images) {
                    if (asset.playbackID) {
                        try {
                            await s3.send(
                                new DeleteObjectCommand({
                                    Bucket: BUCKET,
                                    Key: asset.playbackID,
                                })
                            );
                        } catch (err) {
                            console.warn(`Failed to delete garage post image asset S3 key ${asset.playbackID}:`, err);
                        }

                        try {
                            await db.asset.delete({ where: { id: asset.id } });
                        } catch (err) {
                            console.warn(`Failed to delete asset record ID ${asset.id}:`, err);
                        }
                    }
                }

                // Delete makingOf video asset if any
                if (post.assetId) {
                    const makingOfAsset = await db.asset.findUnique({ where: { id: post.assetId } });
                    if (makingOfAsset?.playbackID) {
                        try {
                            await s3.send(
                                new DeleteObjectCommand({
                                    Bucket: BUCKET,
                                    Key: makingOfAsset.playbackID,
                                })
                            );
                        } catch (err) {
                            console.warn(`Failed to delete makingOf video S3 key ${makingOfAsset.playbackID}:`, err);
                        }

                        try {
                            await db.asset.delete({ where: { id: post.assetId } });
                        } catch (err) {
                            console.warn(`Failed to delete makingOf asset record ID ${post.assetId}:`, err);
                        }
                    }
                }

                // Delete the GaragePost record itself
                await db.garagePost.delete({ where: { id: post.id } });
            } catch (err) {
                console.warn(`Failed to delete GaragePost ID ${post.id}:`, err);
            }
        }

        // Delete Courses, Lessons, and Lesson video assets
        for (const course of user.courses) {
            try {
                for (const lesson of course.lessons) {
                    if (lesson.video?.playbackID) {
                        try {
                            await s3.send(
                                new DeleteObjectCommand({
                                    Bucket: BUCKET,
                                    Key: lesson.video.playbackID,
                                })
                            );
                        } catch (err) {
                            console.warn(`Failed to delete lesson video S3 key ${lesson.video.playbackID}:`, err);
                        }

                        try {
                            await db.asset.delete({ where: { id: lesson.video.id } });
                        } catch (err) {
                            console.warn(`Failed to delete lesson video asset record ID ${lesson.video.id}:`, err);
                        }
                    }
                }

                await db.lesson.deleteMany({ where: { courseId: course.id } });
                await db.course.delete({ where: { id: course.id } });
            } catch (err) {
                console.warn(`Failed to delete course ID ${course.id}:`, err);
            }
        }

        // Delete User's Posts
        try {
            await db.post.deleteMany({ where: { createdById: userId } });
        } catch (err) {
            console.warn("Failed to delete user's posts:", err);
        }

        // Delete User Payments
        try {
            await db.payment.deleteMany({ where: { userId } });
        } catch (err) {
            console.warn("Failed to delete user's payments:", err);
        }

        // Cleanup any leftover assets in S3 by prefix (optional but safe)
        try {
            await db.asset.deleteMany({
                where: {
                    playbackID: {
                        startsWith: `garage/${userId}/*`,
                    },
                },
            });
            await db.asset.deleteMany({
                where: {
                    playbackID: {
                        startsWith: `avatar/${userId}/`,
                    },
                },
            });
        } catch (err) {
            console.warn("Failed to cleanup leftover assets:", err);
        }

        // Finally delete user (this cascades to accounts, sessions)
        await db.user.delete({ where: { id: userId } });

        return { success: true, message: "Account deleted successfully." };
    } catch (err: any) {
        console.error("Account deletion failed:", err.message, err.stack);
        return { success: false, message: "Failed to delete account." };
    }
}
