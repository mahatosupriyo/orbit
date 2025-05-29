import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    await db.payment.updateMany({
      where: {
        razorpayPaymentId: payment.id,
      },
      data: {
        status: "paid",
      },
    });
  }

  return NextResponse.json({ received: true });
}
