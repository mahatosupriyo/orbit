"use client";

import React, { use, useEffect, useMemo, useRef, useState } from "react";
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

type Props =
  | { params: { username: string } }
  | { params: Promise<{ username: string }> };

/**
 * This component uses React.use(params) to safely unwrap a possible Promise `params`
 * and therefore avoids the Next.js warning about direct access to `params.username`.
 *
 * Note: using `use(params)` may suspend if params is a Promise. That's expected per Next.js
 * guidance. NavBar is memoized to avoid visible remount/flashing while this component
 * suspends or fetches data.
 */
export default function UserPage({ params }: Props) {
  // Unwrap `params` safely with React.use() as required by Next.js migration guidance.
  // This avoids direct `params.username` access which triggers the warning.
  // `use()` will synchronously return the object if it's not a Promise, or suspend
  // while it resolves if it is a Promise.
  const resolvedParams = (use as unknown as (p: any) => any)(params);
  const username: string = resolvedParams && typeof resolvedParams === "object"
    ? String((resolvedParams as any).username ?? "")
    : "";

  const { data: session } = useSession();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string; name?: string; image?: string } | null>(null);
  const [posts, setPosts] = useState<GaragePostWithSignedMux[]>([]);

  // Abort controller for current fetch
  const abortRef = useRef<AbortController | null>(null);

  // Fetch when username changes. Using username derived from resolvedParams avoids
  // direct property access warning.
  useEffect(() => {
    if (!username) {
      // params not available — reset to skeleton state
      setLoading(true);
      setError(null);
      setUser(null);
      setPosts([]);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    let didCancel = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/user/${encodeURIComponent(username)}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (controller.signal.aborted || didCancel) return;

        if (res.status === 404) {
          setError("User not found or not authorized.");
          setUser(null);
          setPosts([]);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          setError(json?.message || "Failed to load user.");
          setUser(null);
          setPosts([]);
          setLoading(false);
          return;
        }

        const json = await res.json();

        if (controller.signal.aborted || didCancel) return;

        setUser(json.user ?? null);
        setPosts(Array.isArray(json.posts) ? json.posts : []);
        setLoading(false);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Error fetching user data:", err);
        if (!didCancel) {
          setError("Something went wrong loading the posts.");
          setUser(null);
          setPosts([]);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      didCancel = true;
      controller.abort();
    };
  }, [username]);

  // Keep NavBar stable across renders to avoid flashing while this page suspends/fetches.
  const MemoNavBar = useMemo(() => <NavBar />, []);

  const loggedInUserId = session?.user?.id;
  const userRole = session?.user?.role;
  const isOwnProfile = !!user && user.id === loggedInUserId;

  return (
    <div className={styles.wraper}>
      {MemoNavBar}

      <div className={styles.container}>
        <BackBtn />

        {/* params not resolved yet -> skeleton */}
        {!username && (
          <div className={styles.emptyState} aria-live="polite">
            <Loading />
          </div>
        )}

        {/* username resolved & data loading */}
        {username && loading && (
          <div className={styles.emptyState} aria-live="polite">
            <Loading />
          </div>
        )}

        {/* error */}
        {username && !loading && (error || !user) && (
          <div className={styles.errorState}>
            <p>{error ?? "User not found."}</p>
          </div>
        )}

        {/* content */}
        {username && !loading && user && (
          <>
            <div className={styles.userProfile}>
              <AvatarImageForUser userId={user.id} size={100} />
              <div className={styles.userInfo}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.orbitoriginal} viewBox="0 0 138 231" fill="none" role="img" aria-hidden="true">
                  <path d="M0 0H138V231L69 208.5L0 231V0Z" fill="#1414FF" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M69.1426 135.861C73.1293 135.861 76.3611 132.629 76.3611 128.643C76.3611 124.656 73.1293 121.424 69.1426 121.424C65.1559 121.424 61.924 124.656 61.924 128.643C61.924 132.629 65.1559 135.861 69.1426 135.861ZM69.1426 176.285C95.4548 176.285 116.785 154.955 116.785 128.643C116.785 102.33 95.4548 81 69.1426 81C42.8303 81 21.5 102.33 21.5 128.643C21.5 154.955 42.8303 176.285 69.1426 176.285Z" fill="white" />
                </svg>

                {user.username && (
                  <p className={styles.userUsername}>
                    {user.username} <Icon name="verified" size={11.6} />
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
          </>
        )}
      </div>
    </div>
  );
}
