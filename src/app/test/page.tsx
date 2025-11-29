"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import PostItem from "./component/component";
import styles from "./test.module.scss";
import OrbNavigator from "@/components/ui/orbcomponent/orbnav/orbnavigator";

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
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // keep refs to latest values so observer callback doesn't use stale closures
  const hasMoreRef = useRef(hasMore);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // observer instance ref so we can disconnect it explicitly
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchPage = useCallback(
    async (p: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        const res = await fetch(`/api/server/fetchposts?page=${p}&limit=${limit}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!data?.success) {
          // no more or error -> ensure we stop observing
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
    },
    [limit]
  );

  // initial load
  useEffect(() => {
    void fetchPage(1);
  }, [fetchPage]);

  // observe sentinel to load next page
  useEffect(() => {
    const root = wrapperRef.current;
    const node = sentinelRef.current;

    // cleanup any previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || !root) return;
    if (!hasMoreRef.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e.isIntersecting) return;
        // double-check latest flags from refs
        if (loadingRef.current) return;
        if (!hasMoreRef.current) {
          // safety: stop observing if no more items
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
          return;
        }
        // increment page which triggers fetch side-effect below
        setPage((p) => p + 1);
      },
      {
        root,
        rootMargin: "240px",
        threshold: 0.1,
      }
    );

    observerRef.current = io;
    io.observe(node);

    return () => {
      io.disconnect();
      observerRef.current = null;
    };
  }, [/* no hasMore here: we rely on hasMoreRef to avoid re-creating observer unnecessarily */]);

  // whenever hasMore becomes false, disconnect observer immediately
  useEffect(() => {
    if (!hasMore && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [hasMore]);

  // fetch when page increments (page 1 already fetched by initial load)
  useEffect(() => {
    if (page === 1) return;
    void fetchPage(page);
  }, [page, fetchPage]);

  /**
   * Forward wheel/trackpad scrolls to the feed wrapper when it can scroll.
   *
   * Behavior:
   * - Adds a non-passive 'wheel' listener on window so we can call preventDefault()
   * - If the feed wrapper can scroll in the wheel's direction, prevent default page scroll
   *   and scroll the feed by the deltaY.
   * - Otherwise, let the event bubble so the page can scroll normally.
   *
   * This keeps native feel and prevents grabbing all wheel events unnecessarily.
   */
  useEffect(() => {
    const feedEl = wrapperRef.current;
    if (!feedEl) return;

    const onWheel = (e: WheelEvent) => {
      // Only handle vertical scrolls; ignore if ctrl/meta/shift pressed (user intent)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const deltaY = e.deltaY;
      if (deltaY === 0) return;

      // small epsilon to avoid rounding issues
      const atTop = feedEl.scrollTop <= 0;
      const atBottom = Math.ceil(feedEl.scrollTop + feedEl.clientHeight) >= feedEl.scrollHeight - 1;

      const wantsScrollDown = deltaY > 0;
      const wantsScrollUp = deltaY < 0;

      const canScrollDown = !atBottom;
      const canScrollUp = !atTop;

      // If feed can scroll in the wheel direction, intercept and forward.
      if ((wantsScrollDown && canScrollDown) || (wantsScrollUp && canScrollUp)) {
        e.preventDefault(); // stop the page from scrolling
        // forward the exact delta — adjust multiplier if you want slower/faster scrolling
        feedEl.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
      }
      // otherwise allow normal page scroll behavior
    };

    // Use passive: false so preventDefault() works.
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, []); // run once on mount

  return (
    <div className={styles.wraper}>
      <div className={styles.feed} ref={wrapperRef}>
        {posts.map((post) => (
          <div key={post.id} className={styles.postWrapper}>
            <PostItem post={post} />
          </div>
        ))}

        <div ref={sentinelRef} style={{ width: "100%", height: 1 }} />

        {!hasMore && <div className={styles.end}>No more posts</div>}
      </div>

      <OrbNavigator />
    </div>
  );
}
