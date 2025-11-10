"use client";
import { useState } from "react";

export function useGaragePostLike(initialLiked: boolean, initialCount: number, postId: number) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  async function toggle() {
    // Optimistic UI
    setIsLiked(prev => !prev);
    setLikeCount(prev => prev + (isLiked ? -1 : 1));

    try {
      const res = await fetch("/api/server/togglelike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }), // ✅ FIXED: remove type
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      // Sync count with DB authoritative value
      if (typeof data.likeCount === "number") {
        setLikeCount(data.likeCount);
      }
      if (typeof data.isLiked === "boolean") {
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      // rollback
      setIsLiked(prev => !prev);
      setLikeCount(prev => prev + (isLiked ? 1 : -1));
    }
  }

  return { isLiked, likeCount, toggle };
}
