import { db } from "@/server/db";

export async function checkUserSubscription(userId: string) {
  if (!userId) return false;

  const sub = await db.payment.findFirst({
    where: {
      userId,
      status: "paid",
      endDate: { gte: new Date() },
    },
    orderBy: { endDate: "desc" },
  });

  return Boolean(sub);
}
