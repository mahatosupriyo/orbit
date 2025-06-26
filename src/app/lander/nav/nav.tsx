"use client"
import React from 'react'
import styles from './nav.module.scss'
import Link from 'next/link'
import { easeInOut, motion } from 'framer-motion';

function NavBarLander() {
  return (
    <nav className={styles.navbarcontainer}>

      <div className={styles.navbar}>


        <svg xmlns="http://www.w3.org/2000/svg" height="60" className={styles.otoicon} viewBox="0 0 43 43" >
          <path fillRule="evenodd" clipRule="evenodd" d="M21.1426 24.346C22.9118 24.346 24.346 22.9118 24.346 21.1426C24.346 19.3734 22.9118 17.9392 21.1426 17.9392C19.3734 17.9392 17.9392 19.3734 17.9392 21.1426C17.9392 22.9118 19.3734 24.346 21.1426 24.346ZM21.1426 42.2852C32.8193 42.2852 42.2852 32.8193 42.2852 21.1426C42.2852 9.46586 32.8193 0 21.1426 0C9.46586 0 0 9.46586 0 21.1426C0 32.8193 9.46586 42.2852 21.1426 42.2852Z" />
        </svg>


        <div className={styles.navsubcontainer}>
          <div className={styles.navmenu}>
            <Link className={styles.navlinkchip} href="/">Design Inspirations & Breakdown</Link>
            <Link className={styles.navlinkchip} href="/">Learn with Expert Episodes</Link>
            <Link className={styles.navlinkchip} href="/">The Trip that Changes Everything</Link>
            <Link className={styles.navlinkchip} href="/">What Orbit Learners Say</Link>
            <Link className={styles.navlinkchip} href="/">Start Go Pro+</Link>
          </div>

          <motion.button
            whileTap={{ opacity: 0.6 }}
            className={styles.cta}>
            Get started
          </motion.button>
        </div>


      </div>
    </nav>
  )
}

export default NavBarLander
