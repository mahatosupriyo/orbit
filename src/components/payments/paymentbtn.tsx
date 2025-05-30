"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createRazorpayOrder } from "@/app/actions/actions";
import { useSession } from "next-auth/react";

export function BuyNowButton() {
  const { data: session } = useSession();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  async function onClick() {
    setIsLoading(true);
    const { data, error } = await createRazorpayOrder(9999);

    if (error) {
      setIsLoading(false);
      return;
    }

    if (data) {
      const paymentWindow = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: "On The Orbit",
        description: "Launchpad for Designers",
        currency: "INR",
        order_id: data.id,
        image: "https://www.ontheorbit.com/Essentials/logo.png",
        prefill: {
          name: session?.user?.id,
          email: session?.user?.email,
          contact: "",
        },
        theme: {
          color: "#FBFAFA",
        },
        handler: async function (response: any) {
          const { razorpay_payment_id, razorpay_order_id } = response;

          try {
            const res = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id,
                razorpay_order_id,
                plan: "pro",
              }),
            });

            const result = await res.json();
            if (result.success) {
              router.push("/");
            } else {
              router.push("/test");
            }
          } catch (e) {
            console.error("Error verifying Razorpay", e);
            router.push("/test");
          }
        },
      });

      paymentWindow.open();
      setIsLoading(false);
    }
  }

  return (
    <button className="w-full" onClick={onClick} disabled={isLoading}>
      {isLoading && <Loader2Icon className="animate-spin size-4 mr-2" />}
      Buy now
    </button>
  );
}
