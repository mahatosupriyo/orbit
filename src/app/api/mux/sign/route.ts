import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const MUX_SIGNING_KEY = process.env.MUX_SIGNING_KEY!
const MUX_SIGNING_KEY_ID = process.env.MUX_SIGNING_KEY_ID!

export async function POST(req: Request) {
  const { playbackId } = await req.json()

  if (!playbackId) {
    return NextResponse.json({ error: 'Missing playbackId' }, { status: 400 })
  }

  const EXPIRATION_SECONDS = 60 * 60 
  const expiration = Math.floor(Date.now() / 1000) + EXPIRATION_SECONDS

  const baseUrl = `https://stream.mux.com/${playbackId}.m3u8`
  const basePosterUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`

  const token = jwt.sign(
    {
      exp: expiration,
    },
    MUX_SIGNING_KEY,
    {
      algorithm: 'RS256',
      header: {
        typ: 'JWT',
        alg: 'RS256',
        kid: MUX_SIGNING_KEY_ID,
      },
    }
  )

  const signedVideoUrl = `${baseUrl}?token=${token}`
  const signedPosterUrl = `${basePosterUrl}?token=${token}`

  return NextResponse.json({ signedVideoUrl, signedPosterUrl })
}
