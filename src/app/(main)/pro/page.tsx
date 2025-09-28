"use client"
import { motion } from "framer-motion";
import styles from './pro.module.scss'
import Icon from "@/components/atoms/icons";
import Link from "next/link";
import Footer from "@/components/molecules/footer/footer";

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
                        <Icon name='oto' fill='#222' size={40} />

                        <Link draggable="false" href="/auth" className={styles.cta}>
                            <div className={styles.ctacontent}>
                                Login
                                <Icon name='rightarrowbig' fill='#fff' size={10} />
                            </div>
                        </Link>

                    </motion.nav>


                </div>

            </div>


            <div className={styles.footnote}>
                *Adobe, Spotify, and GoDaddy benefits are available for one year and can be claimed anytime during your active subscription. Each benefit is activated on your personal email and limited to one activation per subscriber. Benefits cannot be transferred or exchanged. Service availability depends on the respective providers’ terms and may change without notice.
                <br /><br />
                **Brand trips will be announced at a later date. Trips start and end in Kolkata; travel to Kolkata is your responsibility. From Kolkata onward, transportation and stays are covered by On the Orbit. Destinations may vary based on availability and scheduling.
                <br /><br />
                Subscriptions automatically renew until cancelled. Restrictions and other terms apply.*
            </div>

            <Footer />
        </div>
    )
}