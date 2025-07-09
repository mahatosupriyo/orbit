"use client"
import Tilt from 'react-parallax-tilt';
import React from 'react'
import styles from './lander.module.scss'
import NavBarLander from './nav/nav'
import Footer from '@/components/molecules/footer/footer'

function Lander() {
  return (
    <div className={styles.wraper}>
      <NavBarLander />
      <div className={styles.container}>
        <div className={styles.hero}>
          <p className={styles.description}>
            Design Education <span className={styles.highlight}>Re-imagined</span>.
          </p>
          <h1 className={styles.bannerheading}>
            they never got it
            <br />
            we do
          </h1>
          <div
            className={styles.bannerwraper}>
            <Tilt
              tiltMaxAngleX={4}
              tiltMaxAngleY={0}
            >

              <img
                src="https://ik.imagekit.io/ontheorbit/Essentials/orbitessential.png?updatedAt=1752058018637"
                draggable="false"
                className={styles.herobanner} />

            </Tilt>
          </div>

        </div>


      </div>
      <Footer />
    </div>
  )
}

export default Lander
