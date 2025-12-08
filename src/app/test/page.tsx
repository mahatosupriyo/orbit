// components/Feed.tsx (replace your current Feed file)
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion, Variants, cubicBezier } from "framer-motion";

import styles from "./test.module.scss";
import OrbNavigator from "@/components/ui/orbcomponent/orbnav/orbnavigator";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import PublicAvatar from "@/components/ui/orbcomponent/orbpost/orbpublicavatar";
import { useGaragePostLike } from "@/server/hooks/useGaragePostLike";
import OrbIcons from "@/components/ui/atomorb/orbicons";

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

function formatWithDomains(rawText: string) {
  if (!rawText) return "";
  const domainRegex =
    /(?<!\()((?:https?:\/\/|www\.)[^\s]+|[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
  return rawText.replace(domainRegex, (match) => {
    if (match.startsWith("http")) return match;
    return `[${match}](https://${match})`;
  });
}

const MarkdownContentRenderer = ({ content }: { content: string }) => (
  <div style={{ fontSize: "1.56rem", lineHeight: "146%", fontWeight: 500, color: "#999", marginTop: "1.2rem", wordBreak: "break-word" }}>
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={{ a: ({ node, ...props }) => <a className={styles.inlinelink} target="_blank" rel="noopener noreferrer" {...props} /> }}>
      {formatWithDomains(content)}
    </ReactMarkdown>
  </div>
);

const TestPostItemBase: React.FC<{ post: GaragePost }> = ({ post }) => {
  const { isLiked, likeCount, toggle } = useGaragePostLike(!!post.isLiked, post.likeCount, post.id);
  const imagesForLightbox = useMemo(() => post.images.map((img) => ({ id: img.id, src: img.url, alt: img.url?.split("/").pop() ?? `${post.createdBy.username}-img-${img.id}` })), [post.images, post.createdBy.username]);

  return (
    <article style={{ overflow: "hidden", padding: "1.8rem", borderBottom: "0.1rem solid hsla(0,0%,100%,0.1)", backgroundColor: "hsla(0,0%,10%,1)" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div><PublicAvatar username={post.createdBy.username} avatarUrl={post.createdBy.image} /></div>
        <div>
          <div style={{ marginBottom: "6px" }}>
            <Link href="/" style={{ color: "#fff", fontWeight: "600", fontSize: "1.66rem", textDecoration: "none", lineHeight: '100%', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {post.createdBy.username}
              <OrbIcons name="verified" size={11} />
            </Link>
          </div>

          <MarkdownContentRenderer content={post.title} />

          {post.images.length > 0 && <div style={{ marginTop: '1rem' }}><ImageLightbox images={imagesForLightbox} previewSize="100%" /></div>}
        </div>
      </div>
    </article>
  );
};
const PostItem = React.memo(TestPostItemBase);

const InfiniteScrollSentinel: React.FC<{ onIntersect: () => void; isFetching: boolean; canFetchMore: boolean; hasUserScrolled?: boolean; }> = ({ onIntersect, isFetching, canFetchMore }) => {
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
      {isFetching && <span className={styles.spinner}>Loading more...</span>}
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
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery<FetchResponse, Error>({
    queryKey: ["garage-posts"],
    queryFn: ({ pageParam = 1, signal }) =>
      fetchPosts({ pageParam: pageParam as number, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });


  const allPosts = useMemo(() => data?.pages.flatMap(p => p.posts) ?? [], [data]);
  const isSubscriber = useMemo(() => (data?.pages?.[0]?.isSubscriber ?? true), [data]);


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

  return (
    <div className={styles.wraper}>
      <div className={styles.feed}>
        {status === "pending" && <div className={styles.loading}>Initial Loading...</div>}
        {status === "error" && <div style={{ color: "salmon", padding: 20 }}>Error: {error?.message ?? "Something went wrong"}</div>}

        {status === "success" && (
          <>
            {allPosts.map((p, i) => (
              <motion.div key={p.id} variants={itemVariants} initial="initial" animate="animate" transition={{ delay: i < 10 ? Math.min(i * 0.05, 0.3) : 0 }}>
                <PostItem post={p} />
              </motion.div>
            ))}

            {/* If not subscribed, show paywall / promotional content below first page */}
            {!isSubscriber && (
              <div style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <h3 style={{ margin: 0, color: "#fff" }}>More posts are for subscribers only</h3>
                <p style={{ color: "#bbb", marginTop: "0.6rem" }}>
                  You've reached the free preview. Subscribe to unlock the full feed and get unlimited access.
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <Link href="/subscribe" className={styles.subscribeBtn}>Subscribe</Link>
                </div>
                {/* "Some other content" can go here: e.g. curated picks, promos */}
                <div style={{ marginTop: "1.2rem", color: "#999" }}>
                  <strong>Curated picks:</strong>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    <li>• Try our curated collection</li>
                    <li>• Follow creators you like</li>
                  </ul>
                </div>
              </div>
            )}

            <InfiniteScrollSentinel
              onIntersect={() => { if (canFetchMore) fetchNextPage(); }}
              isFetching={isFetchingNextPage}
              canFetchMore={canFetchMore}
              hasUserScrolled={hasUserScrolled}
            />
          </>
        )}
      </div>

      <OrbNavigator />
    </div>
  );
}
