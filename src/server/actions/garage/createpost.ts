"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { auth } from "@/auth";
import sharp from "sharp";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.ORBIT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.ORBIT_S3_BUCKET_NAME!;

// ---------- IMAGE CONSTANTS (INSTAGRAM STYLE 4:5 PORTRAIT) ----------
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGES = 5;

// 4:5 aspect ratio (width : height = 1080 : 1350)
const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1350;
const WEBP_QUALITY = 85;
// -------------------------------------------------------------------

/** Normalize and sanitize post text; preserves paragraphs but removes excessive blank lines */
function normalizePostText(text: string) {
  if (!text) return "";
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text.replace(/^\s*\n+/, "");
  text = text.replace(/\n+\s*$/, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/\n{2,}/g, "\n\n");
  return text;
}

/**
 * Server action to create a garage post + upload images to S3 + create Asset rows and attach them.
 *
 * Expects FormData with:
 * - title (string)
 * - caption (string | null)
 * - images (0..n Files) appended with key 'images'
 * - optional externalUrl / makingOf
 */
export async function uploadGaragePost(
  formData: FormData
): Promise<{ success: boolean; message: string; images?: string[] }> {
  try {
    const session = await auth();

    if (!session?.user?.id) return { success: false, message: "Not authenticated" };
    if (session.user.role !== "ADMIN") return { success: false, message: "Not authorized" };

    // Extract & normalize
    let title = formData.get("title")?.toString() || "";
    let caption = formData.get("caption")?.toString() || null;
    const externalUrl = formData.get("externalUrl")?.toString() || null;
    const makingOfPlaybackID = formData.get("makingOf")?.toString() || null;

    title = normalizePostText(title);
    if (caption) caption = normalizePostText(caption);

    // Files (may be zero)
    const files = formData.getAll("images").filter((f) => f instanceof File) as File[];
    if (files.length > MAX_IMAGES) {
      return { success: false, message: `You can upload up to ${MAX_IMAGES} images only` };
    }

    // Validate each file
    for (const f of files) {
      if (f.type && !ALLOWED_IMAGE_TYPES.includes(f.type)) {
        return { success: false, message: "Unsupported image format" };
      }
      if (typeof f.size === "number" && f.size > MAX_IMAGE_SIZE) {
        return { success: false, message: "Image exceeds size limit (10MB)" };
      }
    }

    // require title when images present
    if (files.length > 0 && (!title || title.trim().length === 0)) {
      return { success: false, message: "A title/text is required when uploading images" };
    }

    if ((!title || title.trim().length === 0) && files.length === 0) {
      return { success: false, message: "Post text/title cannot be empty" };
    }

    // Create DB post
    const newPost = await db.garagePost.create({
      data: {
        title,
        caption,
        externalUrl,
        createdById: session.user.id,
      },
    });

    const uploadedUrls: string[] = [];
    const createdAssets: { id: number }[] = [];

    // Upload & asset creation
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // read file into buffer
      let inputBuffer: Buffer;
      try {
        const ab = await file.arrayBuffer();
        inputBuffer = Buffer.from(ab);
      } catch (e) {
        console.warn("Failed to read file buffer:", e);
        continue;
      }

      // ----------- STRICT 4:5 CROP WITH "COVER" BEHAVIOUR -----------
      let outBuffer: Buffer;
      let meta: sharp.Metadata | undefined;
      try {
        const sh = sharp(inputBuffer).rotate(); // auto-orient based on EXIF

        meta = await sh.metadata();

        outBuffer = await sh
          .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
            fit: "cover",     // like object-fit: cover
            position: "centre", // center crop
          })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
      } catch (err) {
        console.warn("Sharp failed for image:", err);
        continue;
      }
      // ---------------------------------------------------------------

      // S3 key & upload
      const fileHash = crypto
        .createHash("md5")
        .update(`${Date.now()}-${file.name}-${Math.random()}`)
        .digest("hex");
      const key = `garage/${session.user.id}/${newPost.id}/images/${fileHash}.webp`;

      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: outBuffer,
            ContentType: "image/webp",
          })
        );
      } catch (s3Err) {
        console.error("S3 upload failed:", s3Err);
        continue;
      }

      const region = process.env.ORBIT_AWS_REGION!;
      const publicUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
      uploadedUrls.push(publicUrl);

      // Create Asset row (match your Prisma schema)
      try {
        const aspectRatio =
          IMAGE_WIDTH && IMAGE_HEIGHT ? `${IMAGE_WIDTH}x${IMAGE_HEIGHT}` : null; // consistent 1080x1350
        const asset = await db.asset.create({
          data: {
            playbackID: key, // store S3 key for reference
            filename: file.name ?? key,
            status: "READY", // AssetStatus enum value
            order: i,
            aspectRatio: aspectRatio ?? undefined,
          },
        });
        createdAssets.push({ id: asset.id });
      } catch (assetErr) {
        console.warn("Failed to create Asset row. Check schema permissions.", assetErr);
      }
    } // end for files

    // Connect created assets to garagePost via many-to-many relation (GaragePostImages)
    if (createdAssets.length > 0) {
      try {
        await db.garagePost.update({
          where: { id: newPost.id },
          data: {
            images: {
              connect: createdAssets.map((a) => ({ id: a.id })),
            },
          },
        });
      } catch (e) {
        console.warn("Could not connect assets to garagePost; check relation fields.", e);
      }
    }

    // If a making-of video playback id was passed, create an Asset and attach via assetId
    if (makingOfPlaybackID) {
      try {
        const videoAsset = await db.asset.create({
          data: {
            playbackID: makingOfPlaybackID,
            filename: makingOfPlaybackID,
            status: "READY",
          },
        });

        // Update garagePost.assetId to reference the video asset (schema uses assetId FK)
        try {
          await db.garagePost.update({
            where: { id: newPost.id },
            data: { assetId: videoAsset.id },
          });
        } catch (e) {
          console.warn("Could not attach makingOf asset to garagePost.", e);
        }
      } catch (e) {
        console.warn("Failed to create makingOf asset:", e);
      }
    }

    // Revalidate any relevant paths (best-effort)
    try {
      revalidatePath("/test");
    } catch (e) {
      console.warn("Revalidate failed:", e);
    }

    return { success: true, message: "Post uploaded successfully", images: uploadedUrls };
  } catch (err) {
    console.error("GaragePost upload error:", err);
    return { success: false, message: "Server error while uploading post" };
  }
}
