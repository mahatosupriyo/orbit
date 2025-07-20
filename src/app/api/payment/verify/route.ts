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


// import { NextResponse } from "next/server";
// import { db } from "@/server/db";
// import crypto from "crypto";

// export async function POST(req: Request) {
//     const body = await req.json();
//     const {
//         razorpay_payment_id,
//         razorpay_order_id,
//         razorpay_signature,
//         plan,
//     }: {
//         razorpay_payment_id: string;
//         razorpay_order_id: string;
//         razorpay_signature: string;
//         plan: "pro" | "exclusive";
//     } = body;

//     // Step 1: Fetch order from DB
//     const payment = await db.payment.findUnique({
//         where: { razorpayOrderId: razorpay_order_id },
//     });

//     if (!payment) {
//         return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
//     }

//     if (payment.status === "paid") {
//         return NextResponse.json({ success: false, error: "Order already verified." }, { status: 400 });
//     }

//     // Step 2: Signature check
//     const expectedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//         .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//         .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//         return NextResponse.json({ success: false, error: "Signature mismatch" }, { status: 400 });
//     }

//     // Step 3: Validate amount
//     const expectedAmount = plan === "pro" ? 1249900 : plan === "exclusive" ? 6124900 : 0;
//     if (payment.amount !== expectedAmount) {
//         return NextResponse.json({ success: false, error: "Amount mismatch" }, { status: 400 });
//     }

//     // Step 4: Set expiry (1 year)
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setFullYear(startDate.getFullYear() + 1);

//     // Step 5: Final update
//     await db.payment.update({
//         where: { razorpayOrderId: razorpay_order_id },
//         data: {
//             razorpayPaymentId: razorpay_payment_id,
//             status: "paid",
//             plan,
//             startDate,
//             endDate,
//         },
//     });

//     return NextResponse.json({ success: true });
// }
