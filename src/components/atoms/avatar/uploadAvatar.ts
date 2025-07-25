"use server";

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { auth } from "@/auth";
import sharp from "sharp";
import crypto from "crypto";
import {
  checkAvatarCooldown,
  setAvatarCooldown,
  acquireAvatarLock,
  releaseAvatarLock,
} from "@/utils/cooldown/avatarCooldown";

const s3Client = new S3Client({
  region: process.env.ORBIT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.ORBIT_S3_BUCKET_NAME!;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const AVATAR_SIZE = 180;
const WEBP_QUALITY = 80;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function updateAvatar(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, message: "You must be logged in to update your avatar" };
  }

  let lockKey: string | null = null;

  try {
    lockKey = await acquireAvatarLock(userId);
    await checkAvatarCooldown(userId);

    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("No valid file uploaded");
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Only JPEG, PNG, GIF, or WebP images are allowed");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large. Max allowed size is 2MB");
    }

    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    if (!currentUser) throw new Error("User not found");

    // Generate unique file name
    const fileHash = crypto.createHash("md5").update(`${Date.now()}-${file.name}`).digest("hex");
    const fileName = `avatar/${userId}/${fileHash}.webp`;

    const fileBuffer = await file.arrayBuffer();
    const processedImage = await sharp(Buffer.from(fileBuffer))
      .resize({ width: AVATAR_SIZE, height: AVATAR_SIZE, fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: processedImage,
        ContentType: "image/webp",
      }),
    );

    // Delete old avatar if custom and internal
    if (
      currentUser.image &&
      !currentUser.image.startsWith("http") &&
      currentUser.image !== "defaultavatar.png"
    ) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: currentUser.image,
          }),
        );
      } catch (err) {
        console.warn("Failed to delete old avatar:", err);
      }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        image: fileName,
        lastImageUpdate: new Date(),
      },
    });

    await setAvatarCooldown(userId);
    revalidatePath("/");

    return { success: true, message: "Avatar updated successfully" };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update avatar",
    };
  } finally {
    if (lockKey) await releaseAvatarLock(lockKey);
  }
}
