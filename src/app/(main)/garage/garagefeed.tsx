"use client";

import styles from './garage.module.scss';
import NavBar from '@/components/molecules/navbar/navbar';
import CapsuleCard from '@/components/molecules/capsules/capsule';
import { motion } from 'framer-motion';

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.785, 0.135, 0.15, 0.86] },
  },
};

interface GaragePost {
  id: number;
  title: string;
  caption: string | null;
  externalUrl: string | null;
  createdAt: string;
  images: { id: number; url: string; order: number | null }[];
  makingOf: { id: number; playbackID: string } | null;
  createdBy: {
    username: string | null;
    image: string | null;
  };
}

export default function GarageFeed({ posts }: { posts: GaragePost[] }) {
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
                  <CapsuleCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
