"use client";

import useSWRInfinite from "swr/infinite";
import { useEffect, useState } from "react";
import styles from "./garage.module.scss";
import NavBar from "@/components/molecules/navbar/navbar";
import CapsuleCard from "@/components/molecules/capsules/capsule";
import { motion, Variants, cubicBezier } from "framer-motion";
import Link from "next/link";
import Icon from "@/components/atoms/icons";
import OrbitLoader from "@/components/atoms/lotties/loader";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const containerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.2 } },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: cubicBezier(0.785, 0.135, 0.15, 0.86) },
  },
};

export default function GarageFeed() {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  const getKey = (pageIndex: number, previousPageData: any) => {
    // Stop fetching if no more data or free user has reached limit
    if (previousPageData && !previousPageData.hasMore) return null;
    if (pageIndex === 0) return `/api/garage`;
    return `/api/garage?cursor=${previousPageData.nextCursor}`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);

  const posts = data ? data.flatMap((page) => page.posts) : [];

  // Determine if we should keep fetching more
  const hasMore = data ? data[data.length - 1].hasMore : true;

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return; // stop listening if no more posts

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 &&
        !isValidating &&
        hasMore
      ) {
        setSize(size + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [size, setSize, isValidating, hasMore]);

  // Check subscription status once
  useEffect(() => {
    async function fetchSubStatus() {
      try {
        const res = await fetch("/api/subscription/status");
        const json = await res.json();
        setHasSubscription(json.active);
      } catch (e) {
        setHasSubscription(false);
      }
    }
    fetchSubStatus();
  }, []);

  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.capsulegrid}>
          <div className={styles.gridhead}>
            <Link
              draggable="false"
              className={styles.linkwraper}
              href="/colorextractor"
              aria-label="Color"
            >
              <div className={styles.gridcapsule}>
                <Icon name="colorextractor" size={46} fill="#fff" />
              </div>
            </Link>
          </div>

          <div className={styles.deengineering}>
            <motion.div
              className={styles.drops}
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              {posts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  className={styles.dropcard}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <CapsuleCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {isValidating && hasMore && (
          <div className={styles.drops} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <OrbitLoader/>
          </div>
        )}
      </div>
    </div>
  );
}
