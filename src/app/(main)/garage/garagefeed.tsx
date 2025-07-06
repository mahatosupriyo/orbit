"use client";

import NavBar from '@/components/molecules/navbar/navbar';
import styles from './garage.module.scss';
import CapsuleCard from '@/components/molecules/capsules/capsule';
import { motion } from 'framer-motion';
import { z } from "zod";
import { useEffect, useState } from 'react';
import { getGaragePosts } from './getGaragePost';

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.785, 0.135, 0.15, 0.86],
    },
  },
};

const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  caption: z.string().nullable(),
  externalUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  images: z.array(z.object({
    id: z.number(),
    url: z.string().url(),
    order: z.number().nullable(),
  })),
  makingOf: z.object({
    id: z.number(),
    playbackID: z.string(),
  }).nullable(),
});

const PostsArraySchema = z.array(PostSchema);

interface GarageFeedProps {
  userId: string;
}

export default function GarageFeed({ userId }: GarageFeedProps) {
  const [posts, setPosts] = useState<z.infer<typeof PostsArraySchema>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getGaragePosts(userId);
        const parsed = PostsArraySchema.parse(data);
        setPosts(parsed);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>

        <div className={styles.capsulegrid}>
          <div className={styles.deengineering}>
            <motion.div
              className={styles.drops}
              variants={containerVariants}
              initial="initial"
              whileInView="animate"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  className={styles.dropcard}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <CapsuleCard post={post} userId={userId} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
