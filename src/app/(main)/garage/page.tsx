import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GarageFeed from "./garagefeed";
import { getGaragePosts } from "./getGaragePost";
import { Metadata } from "next";
import { generateSignedMuxUrls } from "@/utils/signedmuxurl"; 

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


  const safePosts = await Promise.all(posts.map(async (post) => {
    const signedMux = post.makingOf?.playbackID
      ? await generateSignedMuxUrls(post.makingOf.playbackID)
      : null;

    return {
      ...post,
      createdAt: post.createdAt.toISOString(),
      createdBy: {
        username: post.createdBy.username,
        image: post.createdBy.image || "https://ontheorbit.com/placeholder.png",
      },
      signedMux, // add this
    };
  }));


  return <GarageFeed posts={safePosts} />;
}
