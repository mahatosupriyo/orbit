import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/server/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("mux-signature")

    // Verify webhook signature (recommended for security)
    if (process.env.MUX_WEBHOOK_SECRET) {
      const expectedSignature = crypto.createHmac("sha256", process.env.MUX_WEBHOOK_SECRET).update(body).digest("hex")

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(body)

    // Handle video.asset.ready event
    if (event.type === "video.asset.ready") {
      const { data: asset } = event

      if (asset.playback_ids && asset.playback_ids.length > 0) {
        // Update database with playback ID
        await db.asset.updateMany({
          where: {
            muxAssetId: asset.id,
          },
          data: {
            playbackID: asset.playback_ids[0].id,
          },
        })

        console.log(`Asset ${asset.id} is ready with playback ID: ${asset.playback_ids[0].id}`)
      }
    }

    // Handle video.asset.errored event
    if (event.type === "video.asset.errored") {
      const { data: asset } = event

      // Mark asset as failed in database
      await db.asset.updateMany({
        where: {
          muxAssetId: asset.id,
        },
        data: {
          playbackID: "ERROR",
        },
      })

      console.error(`Asset ${asset.id} failed to process:`, asset.errors)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
