"use client";
import { motion, Variants } from 'framer-motion';
import React from 'react';
import styles from './accountnav.module.scss';
import Link from 'next/link';
import Icon from '@/components/atoms/icons';

// Parent variant for staggering children
const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Child variant for slide and fade-in
const itemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.785, 0.135, 0.15, 0.86],
    },
  },
};

function AccountNav() {
  return (
    <motion.div
      className={styles.accountnav}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className={styles.navbtn} variants={itemVariants}>
        <Link draggable="false" className={styles.navlinkchip} href="/">
          <Icon name="settings" />
          Account core
        </Link>
      </motion.div>

      <motion.div className={styles.navbtn} variants={itemVariants}>
        <Link draggable="false" className={styles.navlinkchip} href="/">
          <Icon name="lock" />
          Privacy radar
        </Link>
      </motion.div>

      <motion.div className={styles.navbtn} variants={itemVariants}>
        <Link draggable="false" className={styles.navlinkchip} href="/">
          <Icon name="bill" />
          Membership
        </Link>
      </motion.div>

      <motion.div className={styles.navbtn} variants={itemVariants}>
        <Link draggable="false" className={styles.navlinkchip} href="/">
          <Icon name="help" />
          Support
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default AccountNav;
