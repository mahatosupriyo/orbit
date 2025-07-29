'use server'

import { db } from '@/server/db'
import { Mux } from '@mux/mux-node'

const mux = new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function uploadToMux({
    filename,
    userId,
}: {
    filename: string
    userId: string
}) {
    // Create upload
    const upload = await mux.video.uploads.create({
        new_asset_settings: {
            playback_policy: ['signed'],
        },
        cors_origin: '*',
    })

    const asset = await db.asset.create({
        data: {
            playbackID: '',
            status: 'UPLOADING',
            filename,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    })

    return {
        uploadUrl: upload.url,
        uploadId: upload.id,
        assetDbId: asset.id,
    }
}
