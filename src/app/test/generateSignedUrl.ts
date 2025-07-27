'use server'
import jwt from 'jsonwebtoken'

export async function generateMuxSignedUrls(playbackId: string) {
  const privateKey = process.env.MUX_SIGNING_KEY?.replace(/\\n/g, '\n')!
  const keyId = process.env.MUX_SIGNING_KEY_ID!
  const exp = Math.floor(Date.now() / 1000) + 3600 

  const videoToken = jwt.sign({ sub: playbackId, aud: 'v', exp }, privateKey, { algorithm: 'RS256', keyid: keyId })
  const posterToken = jwt.sign({ sub: playbackId, aud: 't', exp, time: 5, width: 640 }, privateKey, { algorithm: 'RS256', keyid: keyId })

  return {
    videoUrl: `https://stream.mux.com/${playbackId}.m3u8?token=${videoToken}&time=545`,
    posterUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${posterToken}`
  }
}
