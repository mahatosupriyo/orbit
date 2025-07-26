'use server';

import { auth } from '@/auth';
import { db } from '@/server/db';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';

// Initialize the AWS S3 client with credentials from environment variables
const s3 = new S3Client({
  region: process.env.ORBIT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Deletes a garage post and its associated images from the database and S3.
 * @param formData - FormData containing the postId to delete.
 * @returns An object indicating success or error.
 */
export async function deleteGaragePost(formData: FormData) {
  // Authenticate user session
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized' };

  // Validate and parse postId from form data
  const postId = Number(formData.get('postId'));
  if (isNaN(postId)) return { error: 'Invalid post ID' };

  // Fetch the post with related images and makingOf
  const post = await db.garagePost.findUnique({
    where: { id: postId },
    include: {
      images: true,
      makingOf: true,
    },
  });

  if (!post) return { error: 'Post not found' };

  // Check if the user is the owner or an admin
  const isOwner = session.user.id === post.createdById;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) return { error: 'Unauthorized' };

  // Collect all S3 keys to delete (images and makingOf)
  const s3Keys: string[] = [
    ...post.images.map((img) => img.playbackID),
    ...(post.makingOf ? [post.makingOf.playbackID] : []),
  ];

  // Delete associated files from S3 if any exist
  if (s3Keys.length > 0) {
    try {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.ORBIT_S3_BUCKET_NAME!,
          Delete: {
            Objects: s3Keys.map((Key) => ({ Key })),
          },
        })
      );
    } catch (err) {
      // Log error and return a generic error message
      console.error('Failed to delete S3 objects:', err);
      return { error: 'Failed to delete associated files.' };
    }
  }

  // Delete the post from the database
  try {
    await db.garagePost.delete({
      where: { id: postId },
    });
  } catch (err) {
    // Log error and return a generic error message
    console.error('Failed to delete post from database:', err);
    return { error: 'Failed to delete post.' };
  }

  // Revalidate the garage page cache
  revalidatePath('/garage');
  return { success: true };
}
