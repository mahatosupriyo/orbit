// 'use client';

// import { useEffect, useRef, useState, useCallback } from 'react';
// import { motion } from 'framer-motion';
// import CapsuleCard from '@/components/molecules/capsules/capsule';
// import styles from './garage.module.scss';

// type Asset = {
//   id: number;
//   playbackID: string;
// };

// type GaragePost = {
//   id: number;
//   title: string;
//   caption?: string;
//   createdAt: string;
//   images: Asset[];
// };

// export default function GarageFeed({
//   initialPosts,
//   hasMore: initialHasMore,
// }: {
//   initialPosts: GaragePost[];
//   hasMore: boolean;
// }) {
//   const [posts, setPosts] = useState(initialPosts);
//   const [hasMore, setHasMore] = useState(initialHasMore);
//   const [page, setPage] = useState(2);
//   const loaderRef = useRef<HTMLDivElement | null>(null);

//   const fetchMore = useCallback(async () => {
//     const res = await fetch(`/api/garage?page=${page}`);
//     const data = await res.json();
//     setPosts((prev) => [...prev, ...data.posts]);
//     setHasMore(data.hasMore);
//     setPage((prev) => prev + 1);
//   }, [page]);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting && hasMore) {
//         fetchMore();
//       }
//     });

//     if (loaderRef.current) observer.observe(loaderRef.current);
//     return () => observer.disconnect();
//   }, [fetchMore, hasMore]);

//   const containerVariants = {
//     initial: {},
//     animate: {
//       transition: {
//         staggerChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     initial: { opacity: 0, y: 20 },
//     animate: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         ease: [0.785, 0.135, 0.15, 0.86],
//       },
//     },
//   };

//   return (
//     <>
//       <motion.div
//         className={styles.grid}
//         variants={containerVariants}
//         initial="initial"
//         animate="animate"
//       >
//         {posts.map((post) => (
//           <motion.div key={post.id} className={styles.card} variants={itemVariants}>
//             <CapsuleCard
//               imgSrc={`https://image.delivery.domain/${post.images[0]?.playbackID}`}
//             />
//           </motion.div>
//         ))}
//       </motion.div>
//       {hasMore && <div ref={loaderRef} className={styles.loader} />}
//     </>
//   );
// }
