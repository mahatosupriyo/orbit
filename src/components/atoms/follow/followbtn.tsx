"use client";

import { useState } from "react";
import { follow, unfollow } from "@/utils/follow/follow"; // your server actions
import styles from "./followbtn.module.scss";

interface FollowButtonProps {
  isFollowing: boolean;
  targetUserId: string;
}

export default function FollowButton({ isFollowing: initialFollowing, targetUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleFollow() {
    setLoading(true);
    setError(null);
    try {
      if (isFollowing) {
        await unfollow(targetUserId);
        setIsFollowing(false);
      } else {
        await follow(targetUserId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Follow/unfollow failed", error);
      setError("Failed to update follow status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className={`${styles.followBtn} ${isFollowing ? styles.following : ""}`}
        onClick={toggleFollow}
        disabled={loading}
        aria-label={isFollowing ? "Unfollow user" : "Follow user"}
      >
        {loading ? "Loading..." : isFollowing ? "Following" : "Follow"}
      </button>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </>
  );
}
