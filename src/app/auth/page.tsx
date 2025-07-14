"use client"
import React from 'react'
import styles from './auth.module.scss'
import Icon from '@/components/atoms/icons';
import Link from 'next/link';
import { motion } from 'framer-motion'
import { signIn } from "next-auth/react"

/**
 * AuthPage component
 * - Renders the authentication UI for signing in with a provider.
 * - Handles sign-in logic and error reporting.
 * - Shows branding, sign-in button, and legal link.
 */
export default function AuthPage() {

    /**
     * Handles sign-in with the given provider.
     * @param providerName The name of the auth provider (e.g., 'github')
     */
    const handleSignIn = async (providerName: string) => {
        try {
            await signIn(providerName, { callbackUrl: '/' });
        } catch (error) {
            // Log error for debugging
            console.error('Failed to sign in:', error);
        }
    };

    return (
        <div className={styles.authwraper}>
            <div className={styles.authcontainer}>

                {/* Header with logo and title */}
                <div className={styles.authheader}>
                    <Icon name='oto' size={24} />
                    <h1 className={styles.headertxt}>
                        <span className={styles.low}>get started with</span>
                        <br />
                        on the orbit
                    </h1>
                </div>

                {/* Sign-in button for Google (calls GitHub provider, update if needed) */}
                <div className={styles.btnwraper}>
                    <motion.button
                        whileTap={{ opacity: 0.6 }}
                        className={styles.authbtn}
                        onClick={() => handleSignIn('google')}
                    >
                        <img
                            className={styles.providericon}
                            src="https://ik.imagekit.io/ontheorbit/Essentials/GoogleProvider.svg?updatedAt=1747472834072"
                            draggable="false"
                            alt="Google Provider"
                        />
                        <div className={styles.authtextcontainer}>
                            <span className={styles.authtxt}>Continue</span>
                            <span className={styles.authtxt}>with</span>
                            <span className={styles.authtxt}>Google</span>
                        </div>
                    </motion.button>
                </div>

                {/* Footer with terms and privacy links */}
                <p className={styles.authfooter}>
                    By continuing, you agree to our{' '}
                    <Link className={styles.linkinline} href="/">Terms</Link> and{' '}
                    <Link className={styles.linkinline} href="/">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}