"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import PostItem from "./component/component";
import styles from "./test.module.scss";

type GaragePost = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  createdBy: { id: string; username: string; image?: string };
  images: { id: number; url: string }[];
};

export default function Feed() {
  const [posts, setPosts] = useState<GaragePost[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // fetch page (kept stable via useCallback)
  const fetchPage = useCallback(async (p: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch(`/api/server/fetchposts?page=${p}&limit=${limit}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data?.success) {
        setHasMore(false);
        return;
      }

      const next: GaragePost[] = data.posts ?? [];
      setPosts((prev) => (p === 1 ? next : [...prev, ...next]));
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      console.error("feed fetch error:", err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
    }
  }, [limit]);

  // initial load
  useEffect(() => {
    void fetchPage(1);
  }, [fetchPage]);

  // observe sentinel to load next page
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e.isIntersecting) return;
        if (loadingRef.current) return;
        // increment page which triggers fetch side-effect below
        setPage((p) => p + 1);
      },
      { root: null, rootMargin: "240px", threshold: 0.1 }
    );

    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasMore]);

  // fetch when page increments (page 1 already fetched by initial load)
  useEffect(() => {
    if (page === 1) return;
    void fetchPage(page);
  }, [page, fetchPage]);

  return (
    <div className={styles.wraper}>
    <div className={styles.feed}>
      {posts.map((post) => (
        <div key={post.id} className={styles.postWrapper}>
          <PostItem post={post} />
        </div>
      ))}

      <div ref={sentinelRef} />

      {!hasMore && <div className={styles.end}>No more posts</div>}
    </div>
    </div>
  );
}
