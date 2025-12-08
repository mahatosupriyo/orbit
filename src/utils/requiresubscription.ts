"use server";

import { auth } from "@/auth";
import { checkUserSubscription } from "@/utils/hassubscription";

export async function requireSubscription() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, reason: "not-auth" };
  }

  const subscribed = await checkUserSubscription(session.user.id);
  if (!subscribed) {
    return { ok: false, reason: "no-sub" };
  }
// User is authenticated and has an active subscription
  return { ok: true };
}
