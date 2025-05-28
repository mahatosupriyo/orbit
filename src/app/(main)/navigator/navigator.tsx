"use client";
import React from "react";
import styles from "./navigator.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Animation variants for the container.
 * Staggers the appearance of child elements for a smooth entrance effect.
 */
const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Animation variants for each navigation button.
 * Fades in and slides up each button.
 */
const childVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.785, 0.135, 0.15, 0.86],
    },
  },
};

/**
 * Main navigation component.
 * Highlights the active page and animates navigation buttons on specific routes.
 */
const Navigator: React.FC = () => {
  const pathname = usePathname();

  // Only animate on these routes
  const shouldAnimate =
    pathname === "/" || pathname === "/garage" || pathname === "/odyssey";

  // Navigation items configuration for scalability
  const navItems = [
    {
      href: "/garage",
      label: "Garage",
      imgSrc: "https://i.ibb.co/VYv07CYx/image.png",
      imgAlt: "Garage",
    },
    {
      href: "/odyssey",
      label: "Odyssey",
      imgSrc: "https://i.ibb.co/qFss7b0v/image2.png",
      imgAlt: "Odyssey",
    },
  ];

  return (
    <motion.div
      className={styles.mainnavigator}
      // Only apply animation variants if on an animated route
      {...(shouldAnimate
        ? { variants: containerVariants, initial: "initial", animate: "animate" }
        : {})}
    >
      {navItems.map((item) => (
        <motion.div
          key={item.href}
          whileTap={{ scale: 0.98 }}
          {...(shouldAnimate ? { variants: childVariants } : {})}
        >
          <Link
            href={item.href}
            className={styles.pagebtn}
            style={{
              color: "#fff",
              outline: pathname === item.href ? "0.16rem solid #9e9e9e" : "",
            }}
            tabIndex={0}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {/* Use next/image for better performance if possible */}
            <img
              className={styles.pagebanner}
              src={item.imgSrc}
              draggable="false"
              alt={item.imgAlt}
              loading="lazy"
            />
            {item.label}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Navigator;