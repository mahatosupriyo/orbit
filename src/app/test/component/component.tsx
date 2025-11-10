"use client";

import React from "react";
import OrbPost from "@/components/ui/orbcomponent/orbpost/orbpost";
import { useGaragePostLike } from "@/server/hooks/useGaragePostLike"; // adjust if your hook lives elsewhere

type ApiPost = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  createdBy: { id: string; username: string; image?: string };
  images: { id: number; url: string }[];
};

export default function PostItem({ post }: { post: ApiPost }) {
  // Hooks are allowed here — this component is called once per post
  const { isLiked, likeCount, toggle } = useGaragePostLike(post.isLiked, post.likeCount, post.id);

  return (
    <OrbPost
      username={post.createdBy.username}
      avatarUrl={post.createdBy.image}
      content={post.title}
      href={`/${post.createdBy.username}`}
      images={post.images.map((i) => ({ id: i.id, src: i.url, alt: post.title }))}
      likes={likeCount}
      isLiked={isLiked}
      onLike={toggle}
    />
  );
}
