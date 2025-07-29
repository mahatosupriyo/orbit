import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'

export async function POST(req: NextRequest) {
    const event = await req.json()

    if (event.type === 'video.asset.ready') {
        const { id: muxAssetId, playback_ids, duration } = event.data

        await db.asset.updateMany({
            where: { muxAssetId: null, status: 'UPLOADING' },
            data: {
                muxAssetId,
                playbackID: playback_ids?.[0]?.id ?? '',
                status: 'READY',
                duration,
            },
        })
    }

    return NextResponse.json({ received: true })
}
