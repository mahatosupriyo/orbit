"use client"
import React, { useEffect } from 'react'
import styles from './lander.module.scss'
import NavBarLander from './nav/nav'
import Footer from '@/components/molecules/footer/footer'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import AnimatedTextReveal from './revealtxt/revealtext'
import Testimonial from './testimonial/testimonial'
import Pricingtable from './pricingtable/pricingtable'

function Lander() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Smooth scroll spring
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 })

  // Transform from tilted to straight
  const rotateY = useTransform(smoothProgress, [0, 1], [15, 10])
  const rotateX = useTransform(smoothProgress, [0, 1], [0,0])
  const scale = useTransform(smoothProgress, [0, 1], [1.1, 1.3])


  const launchmessage = `you’re here. 

maybe unsure. maybe ready.  
but something in you says — build.  

not just design.  
make something that feels like you.`;




  const features = [
    {
      icon: 'voice' as const,
      title: 'outpaces traditional design grads by miles',
    },

    {
      icon: 'portfolio' as const,
      title: 'leave with a portfolio that lands work',
    },

    {
      icon: 'thinker' as const,
      title: 'understand design beyond the surface',
    },

    {
      icon: 'creator' as const,
      title: 'never run out of ideas',
    },
    {
      icon: 'group' as const,
      title: 'meet your creative crew',
    },


    {
      icon: 'opportunity' as const,
      title: 'make own opportunities',
    },


  ];


  return (
    <div className={styles.wraper} ref={ref}>
      <NavBarLander />
      <div className={styles.container}>
        <div className={styles.hero}>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={styles.description}>
            Design Education <span className={styles.highlight}>Re-imagined</span>.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className={styles.bannerheading}>
            they never got it,
            <br />
            we do.
          </motion.h1>

          <div className={styles.bannerwraper}>
            <motion.img
              src="https://ik.imagekit.io/ontheorbit/Essentials/WEBOPTIM.png?updatedAt=1754198766413"
              draggable="false"
              className={styles.herobanner}
              style={{
                rotateY,
                rotateX,
                scale,
                transformStyle: 'preserve-3d',
              }}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1.1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className={styles.revealtextcontainer}>
          <AnimatedTextReveal text={launchmessage} />
        </div>
        <Testimonial />




        <Pricingtable />

        {/* <div className={styles.benefits}>
          <div className={styles.benefitgrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.feature_card}>
                <div className={styles.icon_wrapper}>
                  <Icon name={feature.icon} size={22} fill="white" />
                </div>
                <h3 className={styles.title}>{feature.title}</h3>
              </div>
            ))}
          </div>
        </div> */}
        <Footer />
      </div>
    </div>
  )
}

export default Lander
