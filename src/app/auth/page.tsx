"use client"

import React, { useEffect } from 'react'
import styles from './auth.module.scss'
import Icon from '@/components/atoms/icons'
import { motion } from 'framer-motion'
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

/**
 * AuthPage component
 * - Handles authentication UI with Google as provider.
 * - Redirects authenticated users to the homepage.
 * - Displays loading state while session is being verified.
 */
export default function AuthPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    /**
     * Redirect user to "/" if already authenticated.
     * Runs whenever `status` changes.
     */
    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/") // safe redirect to homepage
        }
    }, [status, router])

    /**
     * Handle provider sign-in.
     * @param providerName - name of the auth provider (e.g., "google")
     */
    const handleSignIn = async (providerName: string) => {
        try {
            await signIn(providerName, { callbackUrl: '/' })
        } catch (error) {
            // Log error for monitoring/debugging
            console.error('Sign-in failed:', error)
        }
    }

    /**
     * Show loader while session state is being determined
     * Prevents UI flicker before redirect or sign-in screen display.
     */
    if (status === "loading") {
        return (
            <div className={styles.authwraper}>
                <div className={styles.authcontainer}>Checking session.</div>
            </div>
        )
    }

    return (
        <div className={styles.authwraper}>
            <div className={styles.authcontainer}>
                {/* Branding logo */}
                <Icon name='oto' size={40} />

                {/* Google Sign-In Button */}
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
                        {/* <div className={styles.authtextcontainer}>
                            <span className={styles.authtxt}>Continue</span>
                            <span className={styles.authtxt}>with</span>
                            <span className={styles.authtxt}>Google</span>
                        </div> */}
                    </motion.button>
                </div>

                {/* Legal and privacy notice */}
                <p className={styles.authfooter}>
                    By continuing, you agree to our{' '}
                    <a
                        target='_blank'
                        rel="noopener noreferrer"
                        className={styles.linkinline}
                        href="https://www.ontheorbit.com/company/legals"
                    >
                        Legal terms
                    </a>{' '}
                    and{' '}
                    <a
                        target='_blank'
                        rel="noopener noreferrer"
                        className={styles.linkinline}
                        href="https://www.ontheorbit.com/company/legals"
                    >
                        Privacy policy
                    </a>.
                </p>
            </div>
        </div>
    )
}
