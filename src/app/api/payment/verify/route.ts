import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(req: Request) {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, plan } = body;

    try {
        await db.payment.update({
            where: { razorpayOrderId: razorpay_order_id },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                status: "paid",
                plan,
            },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Verification error:", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
