"use client";
import React from 'react';
import styles from './navigator.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const containerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const childVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.785, 0.135, 0.15, 0.86],
        },
    },
};

const Navigator = () => {
    const pathname = usePathname();
    const isGaragePage = pathname === '/garage';
    const isOdysseyPage = pathname === '/odyssey';

    return (
        <motion.div
            className={styles.mainnavigator}
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            <motion.div whileTap={{ scale: 0.98 }} variants={childVariants}>
                <Link
                    href="/garage"
                    className={styles.pagebtn}
                    style={{
                        color: '#fff',
                        outline: isGaragePage ? '0.16rem solid #9e9e9e' : '',
                    }}
                >
                    <img
                        className={styles.pagebanner}
                        src="https://i.ibb.co/VYv07CYx/image.png"
                        draggable="false"
                    />
                    Garage
                </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.98 }} variants={childVariants}>
                <Link
                    href="/odyssey"
                    className={styles.pagebtn}
                    style={{
                        color: '#fff',
                        outline: isOdysseyPage ? '0.16rem solid #9e9e9e' : '',
                    }}
                >
                    <img
                        className={styles.pagebanner}
                        src="https://i.ibb.co/qFss7b0v/image2.png"
                        draggable="false"
                    />
                    Odyssey
                </Link>
            </motion.div>
        </motion.div>
    );
};

export default Navigator;
