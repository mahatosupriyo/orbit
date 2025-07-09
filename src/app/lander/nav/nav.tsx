"use client"
import React from 'react'
import styles from './nav.module.scss'
import Link from 'next/link'

function NavBarLander() {
  return (
    <nav className={styles.navbarcontainer}>

      <div className={styles.navbar}>

        <h1 className={styles.logo}>orbit</h1>

        <Link className={styles.cta} href="/auth">
          Start your story
        </Link>

      </div>
    </nav>
  )
}

export default NavBarLander
