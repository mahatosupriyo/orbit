"use client";

import NavBar from '@/components/molecules/navbar/navbar';
import styles from './home.module.scss';
import Link from 'next/link';
import { motion, AnimatePresence, delay, stagger } from 'framer-motion';
import { usePathname } from 'next/navigation';

const transition = {
  duration: 0.2,
  ease: [0.785, 0.135, 0.15, 0.86],
};

const containerVariants = {
  initial: {},
  exit: { opacity: 0, y: 20, transition },

  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const childVariants = {
  initial: { opacity: 0, y: 20 },
  exit: { opacity: 0, y: 20, transition },

  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.785, 0.135, 0.15, 0.86],
    },
  },
};


export default function Home() {
  const pathname = usePathname();

  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <AnimatePresence mode="wait">
          <div>
            <motion.div
              key={pathname}
              className={styles.main}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={containerVariants}
            >
              <motion.div whileTap={{ scale: 0.99 }} variants={childVariants}>
                <Link href="/garage" className={styles.pagebtn}>
                  <img
                    className={styles.pagebanner}
                    src="https://i.ibb.co/VYv07CYx/image.png"
                    draggable="false"
                  />
                  Garage
                </Link>

              </motion.div>

              <motion.div whileTap={{ scale: 0.99 }} variants={childVariants}>
                <Link href="/odyssey" className={styles.pagebtn}>
                  <img
                    className={styles.pagebanner}
                    src="https://i.ibb.co/qFss7b0v/image2.png"
                    draggable="false"
                  />
                  Odyssey
                </Link>
              </motion.div>


            </motion.div>

          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
