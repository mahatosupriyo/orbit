"use client";

import styles from './garage.module.scss';
import NavBar from '@/components/molecules/navbar/navbar';
import CapsuleCard from '@/components/molecules/capsules/capsule';
import { motion, Variants, cubicBezier } from 'framer-motion';
import Link from 'next/link';
import Icon from '@/components/atoms/icons';

const containerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.2 } },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: cubicBezier(0.785, 0.135, 0.15, 0.86),
    },
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
  signedMux?: {
    signedVideoUrl: string;
    signedPosterUrl: string;
  } | null;
}

export default function GarageFeed({ posts }: { posts: GaragePost[] }) {
  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>


        <div className={styles.capsulegrid}>

          <div className={styles.gridhead}>
            <Link draggable="false" className={styles.linkwraper} href="/colorextractor" aria-label="Color">
              <div
                className={styles.gridcapsule}>
                <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
                  <path d="M24.8478 10.0631C24.8478 9.04192 24.0207 8.21484 22.9996 8.21484C21.9784 8.21484 21.1514 9.04192 21.1514 10.0631V12.8354C21.1514 13.8565 21.9784 14.6836 22.9996 14.6836C24.0207 14.6836 24.8478 13.8565 24.8478 12.8354V10.0631Z" fill="white" />
                  <path d="M16.9143 14.3001L15.0661 12.4519C14.3453 11.7311 13.1717 11.7311 12.4509 12.4519C11.7301 13.1727 11.7301 14.3417 12.4509 15.0671L14.2991 16.9153C14.6595 17.2757 15.1308 17.4559 15.6067 17.4559C16.0826 17.4559 16.5539 17.2757 16.9143 16.9153C17.6351 16.1945 17.6351 15.0255 16.9143 14.3001Z" fill="white" />
                  <path d="M10.0621 24.8488H12.8344C13.8555 24.8488 14.6826 24.0217 14.6826 23.0006C14.6826 21.9794 13.8555 21.1523 12.8344 21.1523H10.0621C9.04094 21.1523 8.21387 21.9794 8.21387 23.0006C8.21387 24.0217 9.04094 24.8488 10.0621 24.8488Z" fill="white" />
                  <path d="M14.2991 29.0858L12.4509 30.934C11.7301 31.6548 11.7301 32.8238 12.4509 33.5492C12.8113 33.9096 13.2826 34.0898 13.7585 34.0898C14.2344 34.0898 14.7057 33.9096 15.0661 33.5492L16.9143 31.701C17.6351 30.9802 17.6351 29.8112 16.9143 29.0858C16.1935 28.365 15.0199 28.365 14.2991 29.0858Z" fill="white" />
                  <path d="M22.9996 31.3175C21.9784 31.3175 21.1514 32.1446 21.1514 33.1657V35.9381C21.1514 36.9592 21.9784 37.7863 22.9996 37.7863C24.0207 37.7863 24.8478 36.9592 24.8478 35.9381V33.1657C24.8478 32.1446 24.0207 31.3175 22.9996 31.3175Z" fill="white" />
                  <path d="M30.933 33.5492C31.2934 33.9096 31.7647 34.0898 32.2407 34.0898C32.7166 34.0898 33.1879 33.9096 33.5483 33.5492C34.2691 32.8284 34.2691 31.6594 33.5483 30.934L31.7 29.0858C30.9792 28.365 29.8056 28.365 29.0848 29.0858C28.364 29.8066 28.364 30.9756 29.0848 31.701L30.933 33.5492Z" fill="white" />
                  <path d="M35.9371 24.8626C36.9582 24.8626 37.7853 24.0356 37.7853 23.0144C37.7853 21.9933 36.9582 21.1662 35.9371 21.1662H33.1648C32.1436 21.1662 31.3165 21.9933 31.3165 23.0144C31.3165 24.0356 32.1436 24.8626 33.1648 24.8626H35.9371Z" fill="white" />
                  <path d="M30.9469 12.4611L29.0987 14.3093C28.3779 15.0301 28.3733 16.1991 29.0987 16.9245C29.4591 17.2849 29.935 17.4652 30.4063 17.4652C30.8776 17.4652 31.3489 17.2849 31.7139 16.9245L33.5621 15.0763C34.2829 14.3555 34.2875 13.1865 33.5621 12.4611C32.8413 11.7403 31.6723 11.7357 30.9469 12.4611Z" fill="white" />
                </svg>
              </div>
            </Link>

          </div>

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
