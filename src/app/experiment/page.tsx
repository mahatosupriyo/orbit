"use client";

import { useState } from "react";
import Link from "next/link";
import { searchGaragePosts } from "./experiment"; // your search server action
import { generateAImessage } from "./aimessage"; // import your AI message action
import styles from "./experiment.module.scss";

export default function GarageSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string>("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setAiMessage("");

    try {
      // 1. Generate AI message
      const msg = await generateAImessage(query.trim());
      setAiMessage(msg);

      // 2. Perform search
      const res = await searchGaragePosts(query.trim());
      setResults(res);
    } catch (err) {
      console.error("Search failed", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Garage AI Search 🔍</h1>

      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="e.g. neumorphism tutorial"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={styles.input}
          disabled={loading}
        />
        <button onClick={handleSearch} disabled={loading} className={styles.button}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Show AI generated message before results */}
      {aiMessage && <p className={styles.aiMessage}>{aiMessage}</p>}

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((post) => (
            <Link key={post.id} href={`/experiment/${post.id}`}>
              <div className={styles.card}>
                {post.images?.[0]?.url && (
                  <img
                    src={post.images[0].url}
                    alt={post.title}
                    width={200}
                    height={250}
                    className={styles.thumbnail}
                  />
                )}
                <div className={styles.content}>
                  <h2 className={styles.title}>{post.title}</h2>
                  {post.caption && <p className={styles.caption}>{post.caption}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && query && results.length === 0 && (
        <p className={styles.nothing}>No matching posts found.</p>
      )}
    </div>
  );
}
