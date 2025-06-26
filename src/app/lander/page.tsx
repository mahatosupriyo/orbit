import React from 'react'
import styles from './lander.module.scss'
import NavBarLander from './nav/nav'

function Lander() {
  return (
    <div className={styles.wraper}>
      <NavBarLander />
      <div className={styles.container}>
        <div className={styles.hero}>
          <div></div>
          <div className={styles.herowraper}>
            <h1 className={styles.herotitle}>
              They never
              <br />
              got it, we do.
            </h1>
            <p className={styles.herosubheading}>
              We knew the gaps. We lived them too.
              So we rebuilt everything.
            </p>
          </div>

        </div>


      </div>
    </div>
  )
}

export default Lander
