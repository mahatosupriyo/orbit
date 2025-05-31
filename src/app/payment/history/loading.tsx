"use client"
import { motion } from 'framer-motion';
import styles from './loading.module.scss';
import NavBar from '@/components/molecules/navbar/navbar';

export default function Loading() {
    return (
        <div className={styles.wraper}>
            <NavBar/>
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.785, 0.135, 0.15, 0.86] }}
                        className={styles.title}>
                        Payment history
                    </motion.h1>
                </div>

                <div className={styles.paymentwraper}>

                </div>
            </div>
        </div>
    )
}