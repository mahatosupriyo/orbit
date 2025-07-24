"use server";

import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { db } from "@/server/db";

const cloudfrontEnv = {
    keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
};

export async function getAvatarByUserId(userId: string): Promise<string> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { image: true },
    });

    const key = user?.image;

    if (!key || key === 'https://ontheorbit.com/placeholder.png') {
        return 'https://ontheorbit.com/placeholder.png';
    }

    if (key.startsWith('http')) {
        return key;
    }

    const url = `${cloudfrontEnv.cloudfrontUrl}/${key}`;

    try {
        const signedUrl = getSignedUrl({
            url,
            keyPairId: cloudfrontEnv.keyPairId,
            privateKey: cloudfrontEnv.privateKey,
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        });

        return signedUrl;
    } catch (error) {
        console.error("Signing error:", error);
        return 'https://ontheorbit.com/placeholder.png';
    }
}
