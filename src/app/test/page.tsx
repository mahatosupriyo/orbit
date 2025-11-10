'use client';

import { useEffect, useState } from "react";
import OrbNavigator from '@/components/ui/orbcomponent/orbnav/orbnavigator';
import styles from './test.module.scss';
import OrbPost from '@/components/ui/orbcomponent/orbpost/orbpost';

export default function HomePage() {
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/server/fetchposts", { cache: "no-store" });
        const data = await res.json();
        // first page → first post = latest
        setPost(data.posts?.[0] ?? null);
      } catch (err) {
        console.error("fetch error:", err);
      }
    }
    fetchLatest();
  }, []);

  return (
    <div className={styles.wraper}>

      {!post && <p style={{ padding: "2rem", color: "#888" }}>Loading latest post...</p>}

      {post && (
        <OrbPost
          username={post.createdBy.username}
          avatarUrl={post.createdBy.image}
          likes={post.likeCount}
          images={post.images.map((img: any) => ({
            id: img.id,
            src: img.url,
            alt: post.title || "post image"
          }))}
          isLiked={false}
          href={`/${post.createdBy.username}`}
          content={post.title}
        />
      )}

      <OrbNavigator />
    </div>
  );
}
