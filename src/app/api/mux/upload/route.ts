import { type NextRequest, NextResponse } from "next/server"
import Mux from "@mux/mux-node"
import { db } from "@/server/db" // Using your provided import path
import { AssetStatus } from "@prisma/client" // Import AssetStatus enum

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()

    // 1. Create a direct upload URL from Mux
    // Mux will return an upload URL and the ID of the asset that will be created
    const upload = await mux.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policy: ["signed"],
        encoding_tier: "baseline",
      },
    })

    // 2. Save the Mux asset ID to your database with an 'UPLOADING' status.
    // The playbackID will be empty initially and updated by the webhook.
    const dbAsset = await db.asset.create({
      data: {
        playbackID: "", // Will be updated by webhook
        muxAssetId: upload.asset_id, // Store the asset_id provided by Mux for this upload
        filename: filename, // Store the original filename
        status: AssetStatus.UPLOADING, // Set initial status to UPLOADING
      },
    })

    // 3. Return the upload URL and the database asset entry to the frontend.
    // The frontend will then upload the file directly to upload.url.
    return NextResponse.json({
      uploadUrl: upload.url,
      asset: dbAsset,
    })
  } catch (error) {
    console.error("Upload creation error:", error)
    return NextResponse.json({ error: "Failed to create upload" }, { status: 500 })
  }
}
