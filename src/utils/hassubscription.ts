import { db } from "@/server/db";

/**
 * Check if a user has an active subscription.
 *
 * Active if:
 * - status === "paid"
 * - endDate is in the future
 *
 * @param userId - The user ID
 * @returns true if subscribed, false otherwise
 */
export async function checkUserSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const sub = await db.payment.findFirst({
      where: {
        userId,
        status: "paid",
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: "desc" }, // prioritize the latest active sub
    });

    return Boolean(sub);
  } catch (err) {
    console.error("checkUserSubscription error:", err);
    return false;
  }
}
