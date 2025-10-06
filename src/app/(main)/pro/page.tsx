"use client"
import { motion } from "framer-motion";
import styles from './pro.module.scss'
import Icon from "@/components/atoms/icons";


export default function ProPage() {
    return (
        <div
            className={styles.wraper}
        >
            <div className={styles.container}>
                <div className={styles.hero}>
                    <motion.nav
                        className={styles.navbar}
                    >
                        <Icon name='otopro' fill='#fff' size={34} />

                    </motion.nav>


                    <div className={styles.headwraper}>
                        <h1 className={styles.headline}>your ideas deserves a better orbit.</h1>
                    </div>

       

                </div>

            </div>

            {/* <Footer /> */}
        </div>
    )
}