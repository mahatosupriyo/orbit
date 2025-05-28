"use client";
import NavBar from "@/components/molecules/navbar/navbar";
import styles from './account.module.scss'
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerdata}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.785, 0.135, 0.15, 0.86] }}
              className={styles.title}>Account settings</motion.h1>
          </div>
          <div
            className={styles.avatar}>
          </div>

        </div>

        <div className={styles.loaderwrapper}>
          <div className={styles.loader}>
          </div>

        </div>
      </div>

    </div>
  )
}