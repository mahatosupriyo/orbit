"use client"
import styles from './test.module.scss'
import Link from 'next/link'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const roles = [
    'Product Designers',
    'Entrepreneurs',
    'Creative Directors',
]

const letterVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.02,
            duration: 0.2,
            ease: [0.785, 0.135, 0.15, 0.86]
        },
    }),
    exit: (i: number) => ({
        opacity: 0,
        y: 20,
        transition: {
            ease: [0.785, 0.135, 0.15, 0.86],
            delay: i * 0.02,
            duration: 0.2,
        },
    }),
}

export default function LandingPage() {

    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % roles.length)
        }, 4500)
        return () => clearInterval(interval)
    }, [])
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>

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

                <div className={styles.hero}>

                    <div className={styles.headingcontainer}>

                        <h3 className={styles.subheadingmed}>
                            Become the next generation of
                        </h3>
                        <h1 className={styles.headingbig}>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={roles[index]}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className={styles.animatedRole}

                                    style={{ display: 'inline-block' }}
                                >
                                    {roles[index].split('').map((char, i) => (
                                        <motion.span
                                            key={i}
                                            variants={letterVariants}
                                            custom={i}
                                            style={{ display: 'inline-block', fontFamily: 'inherit' }}
                                            className={styles.headingbig}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </motion.span>
                            </AnimatePresence>
                        </h1>

                    </div>


                </div>

            </div>

        </div>
    )
}