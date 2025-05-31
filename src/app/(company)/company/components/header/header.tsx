"use client";
import { motion } from 'framer-motion'
import React from 'react'
import styles from './header.module.scss'

interface CompanyHeaderProps {
    titleone: string;
    titletwo: string;
    update: string;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ titleone, titletwo, update }) => {

    return (
        <div className={styles.companyheader}>
            <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: .25 }}
                className={styles.pageheading}
            >
                {titleone}<br />{titletwo}
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: .25, delay: 0.1 }}
                className={styles.update}
            >last updated on {update}
            </motion.p>
        </div>
    )
}

export default CompanyHeader
