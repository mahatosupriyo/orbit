import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GarageFeed from "./garagefeed";
import { getGaragePosts } from "./getGaragePost";
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

  const posts = await getGaragePosts();

  // Convert Date to string and keep username
  const safePosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    createdBy: {
      username: post.createdBy.username,
      image: post.createdBy.image || "https://ontheorbit.com/placeholder.png",
    },
  }));

  return <GarageFeed posts={safePosts} />;
}
