'use server';

import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { db } from '@/server/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import styles from './garage-uploader.module.scss';

import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { auth } from '@/auth';
import { Fragment } from 'react';

const cloudfrontEnv = {
    keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
};

const s3 = new S3Client({
    region: process.env.ORBIT_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.ORBIT_S3_BUCKET_NAME!;

export default async function GaragePostView() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const posts = await db.garagePost.findMany({
        where: { createdById: session.user.id },
        include: {
            images: { orderBy: { order: 'asc' } },
            makingOf: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    if (posts.length === 0) {
        return <div className={styles.notfound}>No posts found</div>;
    }

    const post = posts[0];

    const signedImages = await Promise.all(
        post.images.map(async (image) => {
            const url = `${cloudfrontEnv.cloudfrontUrl}/${image.playbackID}`;
            try {
                const signedUrl = getSignedUrl({
                    url,
                    keyPairId: cloudfrontEnv.keyPairId,
                    privateKey: cloudfrontEnv.privateKey,
                    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
                });
                return { id: image.id, url: signedUrl };
            } catch (err) {
                console.error('Error signing image URL:', err);
                return null;
            }
        })
    );

    async function deletePost() {
        "use server";

        const postToDelete = await db.garagePost.findUnique({
            where: { id: post.id },
            include: {
                images: true,
                makingOf: true,
            },
        });

        if (!postToDelete) return;

        const imageKeys = [
            ...postToDelete.images.map((img) => ({ Key: img.playbackID })),
            ...(postToDelete.makingOf ? [{ Key: postToDelete.makingOf.playbackID }] : []),
        ];

        if (imageKeys.length > 0) {
            try {
                await s3.send(
                    new DeleteObjectsCommand({
                        Bucket: BUCKET_NAME,
                        Delete: { Objects: imageKeys },
                    })
                );
            } catch (err) {
                console.error("Failed to delete from S3:", err);
            }
        }

        // Delete all linked assets (images + makingOf)
        const assetIds = [
            ...postToDelete.images.map((img) => img.id),
            ...(postToDelete.makingOf ? [postToDelete.makingOf.id] : []),
        ];

        if (assetIds.length > 0) {
            await db.asset.deleteMany({
                where: { id: { in: assetIds } },
            });
        }

        await db.garagePost.delete({ where: { id: post.id } });

        revalidatePath("/garage");
        redirect("/garage");
    }


    const firstImage = signedImages.filter(Boolean)[0];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{post.title}</h1>

            {post.caption && <p className={styles.caption}>📝 {post.caption}</p>}
            {post.externalUrl && (
                <p className={styles.external}>
                    🔗 <a href={post.externalUrl} target="_blank" rel="noopener noreferrer">{post.externalUrl}</a>
                </p>
            )}
            {post.makingOf && (
                <p className={styles.makingOf}>
                    🎬 Making-of Video ID: <code>{post.makingOf.playbackID}</code>
                </p>
            )}

            <form action={deletePost}>
                <button type="submit" className={styles.deleteButton}>
                    Delete Post
                </button>
            </form>

            <div className={styles.mainPreview}>
                {firstImage && (
                    <img
                        key={firstImage.id}
                        src={firstImage.url}
                        alt="Main Preview"
                        className={styles.mainImage}
                    />
                )}
            </div>

            <div className={styles.thumbnailRow}>
                {signedImages.filter(Boolean).map((img) => (
                    <Fragment key={img!.id}>
                        <img src={img!.url} alt={`Thumbnail ${img!.id}`} className={styles.thumbnail} />
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
