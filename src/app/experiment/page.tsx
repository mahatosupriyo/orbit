"use client";

import { useState } from "react";
import { searchGaragePosts } from "./experiment";
import styles from "./experiment.module.scss";

// ---- Types used by this page ----
type GarageImage = { id: number; url: string; order: number | null };
type GaragePostItem = {
  id: number;
  title: string;
  caption: string | null;
  images: GarageImage[];
};
type SearchResult = {
  posts: GaragePostItem[];
  hasMore: boolean;
  nextCursor: number | null;
};

export default function GarageSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GaragePostItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setHasMore(false);
    setNextCursor(null);

    try {
      // ⛔️ Fix: don't pass `null` for cursor. Omit the arg or pass `undefined`.
      const res = (await searchGaragePosts(q, undefined)) as SearchResult;
      setResults(res.posts);
      setHasMore(res.hasMore);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Search failed", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const q = query.trim();
    if (!q || !nextCursor) return;

    setLoading(true);
    setError(null);

    try {
      const res = (await searchGaragePosts(q, undefined, nextCursor)) as SearchResult;
      setResults((prev) => [...prev, ...res.posts]);
      setHasMore(res.hasMore);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Load more failed", err);
      setError("Could not load more. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Search anything"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={styles.input}
          disabled={loading}
          maxLength={100} // mirrors server-side MAX_QUERY_LENGTH
        />
        <button onClick={handleSearch} disabled={loading} className={styles.button}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((post) => (
            <div key={post.id} className={styles.card}>
              {post.images?.[0]?.url && (
                <img
                  src={post.images[0].url}
                  alt={post.title}
                  width={200}
                  height={250}
                  className={styles.thumbnail}
                />
              )}
              {/* <div className={styles.content}>
                <h2 className={styles.title}>{post.title}</h2>
                {post.caption && <p className={styles.caption}>{post.caption}</p>}
              </div> */}
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button onClick={handleLoadMore} disabled={loading} className={styles.button}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      {!loading && !error && query && results.length === 0 && (
        <p className={styles.nothing}>No matching posts found.</p>
      )}
    </div>
  );
}
