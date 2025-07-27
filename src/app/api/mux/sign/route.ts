import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
    try {
        const { playbackId } = await request.json()

        if (!playbackId) {
            return NextResponse.json({ error: "Playback ID is required" }, { status: 400 })
        }

        const keyId = process.env.MUX_SIGNING_KEY_ID!
        const keySecret = process.env.MUX_SIGNING_KEY!

        // Create JWT token for signed URL
        const token = jwt.sign(
            {
                sub: playbackId,
                aud: "v", // video
                exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
            },
            Buffer.from(keySecret, "base64"),
            {
                algorithm: "RS256",
                keyid: keyId,
            },
        )

        const signedUrl = `https://stream.mux.com/${playbackId}.m3u8?token=${token}`

        return NextResponse.json({ signedUrl })
    } catch (error) {
        console.error("Signing error:", error)
        return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
    }
}
