// components/Feed.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion, Variants, cubicBezier } from "framer-motion";

import styles from "./test.module.scss";
import OrbNavigator from "@/components/ui/orbcomponent/orbnav/orbnavigator";
import ShimmerLoader from "@/components/atoms/loading/loadingbox";
import PublicAvatar from "@/components/ui/orbcomponent/orbpost/orbpublicavatar";
import OrbIcons from "@/components/ui/atomorb/orbicons";
import { formatPostDate } from "@/server/utils/dateFormat";

const ImageLightbox = dynamic(
  () => import("@/components/ui/orbcomponent/orbimagebox/orbimagelightbox"),
  { ssr: false }
);

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

type FetchResponse = {
  success: boolean;
  posts: GaragePost[];
  hasMore: boolean;
  isSubscriber?: boolean;
};

type FetchContext = { pageParam?: number; signal?: AbortSignal };

const itemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: cubicBezier(0.785, 0.135, 0.15, 0.86) }
  }
};

/**
 * Linkify: returns an array of React nodes where URLs/domains are turned into <a> tags.
 * This approach avoids dangerous innerHTML and keeps text escaped by React.
 */
function Linkify({ text }: { text: string }) {
  if (!text) return null;

  // Matches http(s) URLs, www.* URLs, and bare domains like example.com/path
  const urlRegex = /(?:(https?:\/\/[^\s]+)|(?:www\.[^\s]+)|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}(?:\/[^\s]*)?))/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const idx = match.index;
    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
    const matchedText = match[0];

    // ensure scheme
    const href = matchedText.startsWith("http") ? matchedText : `https://${matchedText}`;
    parts.push(
      <a
        key={idx}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.inlinelink}
        style={{ wordBreak: "break-word" }}
      >
        {matchedText}
      </a>
    );

    lastIndex = idx + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

/**
 * PostText: preserves user-entered newlines (single & multiple) using pre-wrap,
 * and linkifies any URLs/domains using Linkify.
 *
 * This avoids the Markdown pipeline which collapses multiple blank lines
 * and changes whitespace semantics.
 */
const PostText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div
      className={styles.posttxt}
    >
      <Linkify text={text} />
    </div>
  );
};

const TestPostItemBase: React.FC<{ post: GaragePost }> = ({ post }) => {
  const imagesForLightbox = useMemo(
    () =>
      post.images.map((img) => ({
        id: img.id,
        src: img.url,
        alt: img.url?.split("/").pop() ?? `${post.createdBy.username}-img-${img.id}`,
      })),
    [post.images, post.createdBy.username]
  );

  return (
    <article
      className={styles.article}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        <div>
          <PublicAvatar username={post.createdBy.username} avatarUrl={post.createdBy.image} />
        </div>

        <div>
          <div style={{ marginBottom: "6px" }}>
            <Link
              href="/"
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: "1.66rem",
                textDecoration: "none",
                lineHeight: "100%",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {post.createdBy.username}
              <OrbIcons name="verified" size={11} />
            </Link>
          </div>


          {/* Use PostText to preserve user newlines and auto-link URLs */}
          <PostText text={post.title} />

          {post.images.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <ImageLightbox
                images={imagesForLightbox}
                previewSize="100%"
              />

            </div>
          )}

          <p
            style={{
              marginTop: "1.6rem",
              fontSize: "1.12rem",
              fontWeight: 500,
              opacity: 0.36,
            }}
          >
            {formatPostDate(post.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
};
const PostItem = React.memo(TestPostItemBase);

const InfiniteScrollSentinel: React.FC<{
  onIntersect: () => void;
  isFetching: boolean;
  canFetchMore: boolean;
  hasUserScrolled?: boolean;
}> = ({ onIntersect, isFetching, canFetchMore }) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && canFetchMore && !isFetching) {
        onIntersect();
      }
    });

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [onIntersect, canFetchMore, isFetching]);

  return (
    <div ref={sentinelRef} style={{ height: "20px", margin: "20px 0", textAlign: "center", opacity: 0.5 }}>
      {isFetching && (
        <div
          style={{
            padding: "1.8rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
          className={styles.spinner}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "1rem" }}>
            <ShimmerLoader height="3.8rem" width="3.8rem" borderRadius="50rem" />
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", marginTop: "0.2rem", flexDirection: "row", alignItems: "center", gap: "0.4rem" }}>
                <ShimmerLoader height="2rem" width="14.8rem" borderRadius="50rem" />
              </div>
              <div style={{ marginTop: "0.6rem" }}>
                <ShimmerLoader height="1.6rem" width="6rem" borderRadius="4rem" />
              </div>

              <ShimmerLoader height="26rem" width="18rem" borderRadius="1.6rem" />
            </div>
          </div>
        </div>
      )}
      {!canFetchMore && <span style={{ color: "#aaa" }}>You've seen all new posts.</span>}
    </div>
  );
};

const fetchPosts = async ({ pageParam = 1, signal }: FetchContext): Promise<FetchResponse> => {
  const res = await fetch(`/api/server/fetchposts?page=${pageParam}&limit=10`, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });

  if (res.status === 401) throw new Error("Authentication required");
  if (res.status === 429) throw new Error("Rate limit exceeded");
  if (!res.ok) throw new Error(`Failed to fetch posts (status ${res.status})`);

  const json = (await res.json()) as FetchResponse;
  return json;
};

export default function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery<
    FetchResponse,
    Error
  >({
    queryKey: ["garage-posts"],
    queryFn: ({ pageParam = 1, signal }) => fetchPosts({ pageParam: pageParam as number, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const allPosts = useMemo(() => data?.pages.flatMap((p) => p.posts) ?? [], [data]);
  const isSubscriber = useMemo(() => data?.pages?.[0]?.isSubscriber ?? true, [data]);

  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasUserScrolled && window.scrollY > 50) {
        setHasUserScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasUserScrolled]);

  // canFetchMore: true only when user is subscriber and backend says there is more
  const canFetchMore = !!isSubscriber && !!hasNextPage;

  // memoized fetchNextPage callback (optional)
  const handleFetchNext = useCallback(() => {
    if (canFetchMore) fetchNextPage();
  }, [canFetchMore, fetchNextPage]);

  return (
    <div className={styles.wraper}>
      <div className={styles.feed}>
        {status === "pending" && (
          <div
            className={styles.loading}
            style={{
              padding: "1.8rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "1rem" }}>
              <ShimmerLoader height="3.8rem" width="3.8rem" borderRadius="50rem" />
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", marginTop: "0.2rem", flexDirection: "row", alignItems: "center", gap: "0.4rem" }}>
                  <ShimmerLoader height="2rem" width="14.8rem" borderRadius="50rem" />
                </div>
                <div style={{ marginTop: "0.6rem" }}>
                  <ShimmerLoader height="1.6rem" width="6rem" borderRadius="4rem" />
                </div>

                <ShimmerLoader height="26rem" width="18rem" borderRadius="1.6rem" />
              </div>
            </div>
          </div>
        )}

        {status === "error" && <div style={{ color: "salmon", padding: 20 }}>Error: {error?.message ?? "Something went wrong"}</div>}

        {status === "success" && (
          <>
            {allPosts.map((p, i) => (
              <motion.div key={p.id} variants={itemVariants} initial="initial" animate="animate" transition={{ delay: i < 10 ? Math.min(i * 0.05, 0.3) : 0 }}>
                <PostItem post={p} />
              </motion.div>
            ))}

            {!isSubscriber && (
              <div style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <h3 style={{ margin: 0, color: "#fff" }}>More posts are for subscribers only</h3>
                <p style={{ color: "#bbb", marginTop: "0.6rem" }}>
                  You've reached the free preview. Subscribe to unlock the full feed and get unlimited access.
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <Link href="/subscribe" className={styles.subscribeBtn}>
                    Subscribe
                  </Link>
                </div>

                <div style={{ marginTop: "1.2rem", color: "#999" }}>
                  <strong>Curated picks:</strong>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    <li>• Try our curated collection</li>
                    <li>• Follow creators you like</li>
                  </ul>
                </div>
              </div>
            )}

            <InfiniteScrollSentinel onIntersect={handleFetchNext} isFetching={isFetchingNextPage} canFetchMore={canFetchMore} hasUserScrolled={hasUserScrolled} />
          </>
        )}
      </div>
      <OrbNavigator />
    </div>
  );
}
