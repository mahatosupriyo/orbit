"use client";

import { useState } from "react";
import { follow, unfollow } from "@/utils/follow/follow";
import styles from "./followbtn.module.scss";
import { toast } from "react-hot-toast";

interface FollowButtonProps {
    isFollowing: boolean;
    targetUserId: string;
    initialFollowerCount: number;
}

export default function FollowButton({
    isFollowing: initialFollowing,
    targetUserId,
    initialFollowerCount,
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function toggleFollow() {
        setLoading(true);
        try {
            if (isFollowing) {
                await unfollow(targetUserId);
                setIsFollowing(false);
                setFollowerCount((prev) => Math.max(prev - 1, 0));
                toast.success("Unfollowed successfully");
            } else {
                await follow(targetUserId);
                setIsFollowing(true);
                setFollowerCount((prev) => prev + 1);
                toast.success("Followed successfully");
            }
        } catch (error: any) {
            console.error("Try later, suspicious activity detected.", error);
            toast.error(error?.message || "Please try again later.");
            setError(error?.message || null);
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
                aria-label={isFollowing ? "Disconnect" : "Connect"}
            >
                {loading ? "Connected" : isFollowing ? "Connected" : "Connect+"}
                {followerCount > 0 && (
                    <span className={styles.followkey}>
                        {followerCount}
                    </span>
                )}
            </button>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </>
    );
}
