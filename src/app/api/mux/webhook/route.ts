// src/app/api/webhooks/mux/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import crypto from 'crypto'

export const config = {
  api: {
    bodyParser: false,
  },
}

function verifyMuxSignature(rawBody: Buffer, signature: string | null) {
  const secret = process.env.MUX_WEBHOOK_SECRET!
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  )
}

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer()
  const signature = req.headers.get('mux-signature') || null

  const isValid = verifyMuxSignature(Buffer.from(rawBody), signature)

  if (!isValid) {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(Buffer.from(rawBody).toString('utf-8'))

  if (event.type === 'video.asset.ready') {
    const { id: muxAssetId, playback_ids, duration } = event.data

    await db.asset.updateMany({
      where: {
        muxAssetId: null,
        status: 'UPLOADING',
      },
      data: {
        muxAssetId,
        playbackID: playback_ids?.[0]?.id ?? '',
        status: 'READY',
        duration,
      },
    })
  }

  if (event.type === 'video.asset.errored') {
    const { id: muxAssetId } = event.data

    await db.asset.updateMany({
      where: {
        muxAssetId: null,
        status: 'UPLOADING',
      },
      data: {
        muxAssetId,
        status: 'ERROR',
      },
    })
  }

  return NextResponse.json({ received: true })
}
