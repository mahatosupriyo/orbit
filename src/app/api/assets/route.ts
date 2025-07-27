import { NextResponse } from "next/server"
import { db } from "@/server/db"

export async function GET() {
    try {
        const assets = await db.asset.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(assets)
    } catch (error) {
        console.error("Assets fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
    }
}
