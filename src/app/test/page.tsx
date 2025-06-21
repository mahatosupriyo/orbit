"use client"
import styles from './test.module.scss'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Footer from '@/components/molecules/footer/footer'

export default function LandingPage() {
    return (
        <div className={styles.wraper}>
            <div className={styles.navbar}>

                <div className={styles.navleft}>

                    <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.99 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Link href="/" className={styles.logo}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={styles.otoicon} viewBox="0 0 366 366" fill="#202020">
                                <path fillRule="evenodd" clipRule="evenodd" d="M183 210.652C198.272 210.652 210.652 198.272 210.652 183C210.652 167.728 198.272 155.348 183 155.348C167.728 155.348 155.348 167.728 155.348 183C155.348 198.272 167.728 210.652 183 210.652ZM183 365.5C283.792 365.5 365.5 283.792 365.5 183C365.5 82.208 283.792 0.5 183 0.5C82.208 0.5 0.5 82.208 0.5 183C0.5 283.792 82.208 365.5 183 365.5Z" />
                            </svg>
                        </Link>
                    </motion.div>





                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.99 }}
                        className={styles.navbtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 63" fill='none' >
                            <path d="M0 31.6873H63M30.1104 63V0" stroke="#202020" strokeWidth="4" />
                        </svg>
                    </motion.button>


                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={styles.cta}>

                    <img
                        className={styles.providericon}
                        src="https://ik.imagekit.io/ontheorbit/Essentials/GoogleProvider.svg?updatedAt=1747472834072"
                        draggable="false"
                        alt="Google Provider"
                    />
                    Get started
                </motion.button>

            </div>

            <div className={styles.container}>


                <div className={styles.hero}>

                    <div className={styles.heroheading}>
                        <h1 className={styles.herotitle}>
                            They never<br />got it. You do.
                        </h1>
                    </div>
                    <div className={styles.descriptioncontainer}>
                        <div className={styles.leftpanel}>
                        </div>
                        <div className={styles.descriptionwraper}>

                            <p className={styles.description}>
                                We felt it too —
                                <br /><br />
                                Paying huge fees for theory, no real tools, no hands-on work.
                                <br />
                                Thousands of designers felt the same: lost, overcharged, and underestimated.
                                <br /><br />

                                <div className={styles.highlight}>
                                    ' You were not the problem,
                                    <br />
                                    The system was.'
                                </div>
                                <br />
                                We at Orbit rebuilt everything.

                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.applycontainer}>
                    <h2 className={styles.label}>
                        Limited Seats*, only <span className={styles.boldunder}>40 Seats</span> Across Globe
                    </h2>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Link className={styles.applybtn} href="/">
                            Be Pro
                        </Link>
                    </motion.div>
                </div>


            </div>
            <Footer />

        </div>
    )
}