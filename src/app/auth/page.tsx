"use client"
import React from 'react'
import styles from './auth.module.scss'
import Icon from '@/components/atoms/icons';
import Link from 'next/link';
import { motion } from 'framer-motion'
import { signIn } from "next-auth/react"

export default function AuthPage() {

    const handleSignIn = async (providerName: string) => {
        try {
            await signIn(providerName, { callbackUrl: '/' });
        } catch (error) {
            console.error('Failed to sign in:', error);
        }
    };
    return (
        <div className={styles.authwraper}>

            <div className={styles.authcontainer}>

                <div className={styles.authheader}>

                    <Icon name='oto' size={70} />
                    <h1 className={styles.headertxt}>
                        <span className={styles.low}>get started with</span>
                        <br />
                        on the orbit</h1>
                </div>

                <div className={styles.btnwraper}>
                    <motion.button
                        whileTap={{ opacity: 0.6 }}
                        className={styles.authbtn}
                        onClick={() => handleSignIn('github')}
                    >
                        <img
                            className={styles.providericon}
                            src="https://ik.imagekit.io/ontheorbit/Essentials/GoogleProvider.svg?updatedAt=1747472834072"
                            draggable="false" />

                        <div className={styles.authtextcontainer}>
                            <span className={styles.authtxt}>Continue</span>
                            <span className={styles.authtxt}>with</span>
                            <span className={styles.authtxt}>Google</span>
                        </div>

                    </motion.button>
                </div>
                <p className={styles.authfooter}>By continuing, you agree to our <Link className={styles.linkinline} href="/">Terms</Link> and <Link className={styles.linkinline} href="/">Privacy Policy</Link>.</p>
            </div>
        </div>
    );
}

