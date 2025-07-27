'use server'

import jwt from 'jsonwebtoken'

export async function generateSignedMuxUrls(playbackId: string) {
  const MUX_SIGNING_KEY_ID = process.env.MUX_SIGNING_KEY_ID!
  const MUX_SIGNING_KEY = process.env.MUX_SIGNING_KEY!
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60

  const signToken = (type: 'v' | 't') =>
    jwt.sign(
      { exp: expiration, kid: MUX_SIGNING_KEY_ID, aud: type, sub: playbackId },
      MUX_SIGNING_KEY,
      { algorithm: 'RS256', keyid: MUX_SIGNING_KEY_ID }
    )

  return {
    signedVideoUrl: `https://stream.mux.com/${playbackId}.m3u8?token=${signToken('v')}`,
    signedPosterUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${signToken('t')}`,
  }
}
