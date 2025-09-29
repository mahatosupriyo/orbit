"use client";

import React, { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import NavBar from "@/components/molecules/navbar/navbar";
import AvatarImageForUser from "@/components/atoms/avatar/useravatar";
import Icon from "@/components/atoms/icons";
import BackBtn from "@/components/atoms/(buttons)/backbtn/backbtn";
import GaragePostCard from "./usercapsule/usercapsule";
import styles from "./username.module.scss";
import type { GaragePost } from "@/types/userposts";
import Loading from "./loading";

type GaragePostWithSignedMux = GaragePost & {
  signedMux?: { signedVideoUrl: string; signedPosterUrl: string } | null;
};

export default function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string; name?: string; image?: string } | null>(null);
  const [posts, setPosts] = useState<GaragePostWithSignedMux[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/user/${encodeURIComponent(username)}`, {
          credentials: "include",
        });

        if (res.status === 404) {
          setError("User not found or not authorized.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          setError(json?.message || "Failed to load user.");
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (!cancelled) {
          setUser(json.user);
          setPosts(json.posts || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (!cancelled) {
          setError("Something went wrong loading the posts.");
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className={styles.wraper}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <Loading/>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.wraper}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p>{error ?? "User not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const loggedInUserId = session?.user?.id;
  const userRole = session?.user?.role;
  const isOwnProfile = user.id === loggedInUserId;

  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <BackBtn />

        <div className={styles.userProfile}>
          <AvatarImageForUser userId={user.id} size={100} />
          <div className={styles.userInfo}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.orbitoriginal} viewBox="0 0 138 231" fill="none">
              <path d="M0 0H138V231L69 208.5L0 231V0Z" fill="#1414FF" />
              <path fillRule="evenodd" clipRule="evenodd" d="M69.1426 135.861C73.1293 135.861 76.3611 132.629 76.3611 128.643C76.3611 124.656 73.1293 121.424 69.1426 121.424C65.1559 121.424 61.924 124.656 61.924 128.643C61.924 132.629 65.1559 135.861 69.1426 135.861ZM69.1426 176.285C95.4548 176.285 116.785 154.955 116.785 128.643C116.785 102.33 95.4548 81 69.1426 81C42.8303 81 21.5 102.33 21.5 128.643C21.5 154.955 42.8303 176.285 69.1426 176.285Z" fill="white" />
            </svg>

            {user.username && (
              <p className={styles.userUsername}>
                {user.username}
                <Icon name="verified" size={11.6} />
              </p>
            )}

            {user.name && (
              <h1 className={styles.userName}>
                {user.name}
                {isOwnProfile && <span className={styles.ownProfileBadge} />}
              </h1>
            )}
          </div>
        </div>

        <div className={styles.postsSection}>
          <h2 className={styles.sectionTitle}></h2>
          <div className={styles.gridpostlayout}>
            {posts.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
              </div>
            ) : (
              posts.map((post) => (
                <GaragePostCard
                  key={post.id}
                  post={post}
                  canDelete={isOwnProfile || userRole === "ADMIN"}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
