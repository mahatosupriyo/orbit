"use server";

import { razorpay } from "@/lib/razorpay";
import { tryCatch } from "@/lib/try-catch";
import { db } from "@/server/db";
import { auth } from "@/auth";

export async function createRazorpayOrder(amount: number) {
  const { data, error } = await tryCatch(
    razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: Date.now().toString(),
      payment_capture: true,
    })
  );

  if (error || !data) {
    return {
      data: null,
      error: "Something went wrong.",
    };
  }

  const session = await auth();
  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  await db.payment.create({
    data: {
      userId: session.user.id,
      razorpayOrderId: data.id,
      amount: data.amount as number,
      status: "created",
      plan: "pro",
    },
  });

  return {
    data: {
      id: data.id,
      amount: data.amount,
    },
    error: null,
  };
}
