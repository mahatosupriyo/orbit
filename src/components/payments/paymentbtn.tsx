"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createRazorpayOrder } from "@/app/actions/actions";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Button from "../atoms/button/button";

interface BuyNowButtonProps {
  plan: string;              // e.g., "pro", "exclusive", etc.
  amount: number;            // in paise (e.g., 9999 means ₹99.99)
  description?: string;      // optional description
  buttonLabel?: string;      // optional label, default "Buy Now"
}

export function BuyNowButton({
  plan,
  amount,
  description = "Launchpad for Designers",
  buttonLabel = "Buy Now",
}: BuyNowButtonProps) {
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

    const { data, error } = await createRazorpayOrder(amount, plan);

    if (error) {
      setIsLoading(false);
      toast.error(error);
      return;
    }


    if (data) {
      const paymentWindow = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: "On The Orbit",
        description,
        currency: "INR",
        order_id: data.id,
        image: "https://www.ontheorbit.com/Essentials/logo.png",
        prefill: {
          name: session?.user?.name || "Guest",
          email: session?.user?.email || "",
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
                plan,
              }),
            });

            const result = await res.json();
            if (result.success) {
              toast.success("Payment successful! Redirecting...");
              router.push("/");
            } else {
              toast.error("Payment verification failed.");
              router.push("/test");
            }
          } catch (e) {
            console.error("Error verifying Razorpay", e);
            toast.error("An error occurred during payment verification.");
            router.push("/test");
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment window closed.");
            setIsLoading(false);
          },
        },
      });

      paymentWindow.open();
      setIsLoading(false);
    }
  }

  return (
    <Button
      fullWidth
      style={{
        background: '#0C8CE9',
        color: '#fff'
      }}
      onClick={onClick}
      disabled={isLoading}
    >
      {buttonLabel}
    </Button>
  );
}
