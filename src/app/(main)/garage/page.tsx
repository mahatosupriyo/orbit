import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GarageFeed from "./garagefeed";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ontheorbit.com"),
  title: "Garage",
};

export default async function GaragePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  return <GarageFeed />;
}
