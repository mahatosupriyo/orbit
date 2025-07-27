import { type NextRequest, NextResponse } from "next/server"
import Mux from "@mux/mux-node"

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const asset = await mux.video.assets.retrieve(params.id)
        return NextResponse.json(asset)
    } catch (error) {
        console.error("Asset retrieval error:", error)
        return NextResponse.json({ error: "Failed to retrieve asset" }, { status: 500 })
    }
}
