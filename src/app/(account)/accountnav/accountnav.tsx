"use client"
import { motion } from 'framer-motion'
import React from 'react'
import styles from './accountnav.module.scss'
import Link from 'next/link'
import Icon from '@/components/atoms/icons'

function AccountNav() {
    return (
        <div className={styles.accountnav}>
            <motion.div className={styles.navbtn}>
                <Link className={styles.navlinkchip} href="/">
                    <Icon name='settings' />
                    Account core
                </Link>
            </motion.div>

            <motion.div className={styles.navbtn}>
                <Link className={styles.navlinkchip} href="/">
                    <Icon name='lock' />
                    Privacy radar
                </Link>
            </motion.div>

            <motion.div className={styles.navbtn}>
                <Link className={styles.navlinkchip} href="/">
                    <Icon name='bill' />
                    Membership
                </Link>
            </motion.div>

            <motion.div className={styles.navbtn}>
                <Link className={styles.navlinkchip} href="/">
                    <Icon name='help' />
                    Support
                </Link>
            </motion.div>
        </div>
    )
}

export default AccountNav
