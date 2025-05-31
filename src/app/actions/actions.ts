"use server";

import { razorpay } from "@/lib/razorpay";
import { tryCatch } from "@/lib/try-catch";
import { db } from "@/server/db";
import { auth } from "@/auth";

export async function createRazorpayOrder(amount: number, plan: string) {
  const session = await auth();
  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  // 🔒 Check if the user has *any* active subscription (Pro or Exclusive)
  const existingPayment = await db.payment.findFirst({
    where: {
      userId: session.user.id,
      status: "paid",
      endDate: {
        gt: new Date(),
      },
    },
  });

  if (existingPayment) {
    return {
      data: null,
      error: `You’re already subscribed.`,
    };
  }

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
      error: "Something went wrong while creating the order.",
    };
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(startDate.getFullYear() + 1);

  await db.payment.create({
    data: {
      userId: session.user.id,
      razorpayOrderId: data.id,
      amount: data.amount as number,
      status: "created",
      plan,
      startDate,
      endDate,
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
