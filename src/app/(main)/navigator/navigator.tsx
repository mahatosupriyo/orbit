// "use client";
// import React from "react";
// import styles from "./navigator.module.scss";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { motion } from "framer-motion";

// /**
//  * Animation variants for the container.
//  * Staggers the appearance of child elements for a smooth entrance effect.
//  */
// const containerVariants = {
//   initial: {},
//   animate: {
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// /**
//  * Animation variants for each navigation button.
//  * Fades in and slides up each button.
//  */
// const childVariants = {
//   initial: { opacity: 0, y: 20 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//       ease: [0.785, 0.135, 0.15, 0.86],
//     },
//   },
// };

// /**
//  * Main navigation component.
//  * Highlights the active page and animates navigation buttons on specific routes.
//  */
// const Navigator: React.FC = () => {
//   const pathname = usePathname();

//   // Only animate on these routes
//   const shouldAnimate =
//     pathname === "/" || pathname === "/garage" || pathname === "/odyssey";

//   // Navigation items configuration for scalability
//   const navItems = [
//     {
//       href: "/garage",
//       label: "Garage",
//       imgSrc: "https://i.ibb.co/VYv07CYx/image.png",
//       imgAlt: "Garage",
//     },
//     {
//       href: "/odyssey",
//       label: "Odyssey",
//       imgSrc: "https://i.ibb.co/qFss7b0v/image2.png",
//       imgAlt: "Odyssey",
//     },
//   ];

//   return (
//     <motion.div
//       className={styles.mainnavigator}
//       {...(shouldAnimate
//         ? { variants: containerVariants, initial: "initial", animate: "animate" }
//         : {})}
//     >
//       {navItems.map((item) => (
//         <motion.div
//           key={item.href}
//           whileTap={{ scale: 0.98 }}
//           {...(shouldAnimate ? { variants: childVariants } : {})}
//         >
//           <Link
//             href={item.href}
//             className={styles.pagebtn}
//             style={{
//               color: "#fff",
//               outline: pathname === item.href ? "0.16rem solid #9e9e9e" : "",
//             }}
//             tabIndex={0}
//             aria-current={pathname === item.href ? "page" : undefined}
//           >
//             <img
//               className={styles.pagebanner}
//               src={item.imgSrc}
//               draggable="false"
//               alt={item.imgAlt}
//               loading="lazy"
//             />
//             <p className={styles.itemlabel}>
//               {item.label}
//             </p>
//           </Link>
//         </motion.div>
//       ))}
//     </motion.div>
//   );
// };

// export default Navigator;



"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./navigator.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Animation variants for the container.
 */
const containerVariants = {
  initial: { y: "-100%", opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.785, 0.135, 0.15, 0.86], staggerChildren: 0.1 },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    transition: { duration: 0.3, ease: [0.785, 0.135, 0.15, 0.86] },
  },
};

/**
 * Animation variants for each navigation button.
 */
const childVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * Main navigation component.
 */
const Navigator: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
    <div className={styles.mainnavigatorcontainer}>
      {/* Hamburger button */}
      <button
        className={styles.hamburger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </button>

      {/* Desktop Nav */}
      <div className={styles.desktopNav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.pagebtn}
            style={{
              color: "#fff",
              outline: pathname === item.href ? "0.16rem solid #9e9e9e" : "",
            }}
          >
            <img
              className={styles.pagebanner}
              src={item.imgSrc}
              draggable="false"
              alt={item.imgAlt}
              loading="lazy"
            />
            <p className={styles.itemlabel}>{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)} // closes menu when clicked
            />

            {/* Mobile Nav */}
            <motion.div
              className={styles.mobileNav}
              ref={menuRef}
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  variants={childVariants}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={item.href}
                    className={styles.pagebtn}
                    onClick={() => setIsOpen(false)}
                    style={{
                      color: "#fff",
                      outline:
                        pathname === item.href ? "0.16rem solid #9e9e9e" : "",
                    }}
                  >
                    <img
                      className={styles.pagebanner}
                      src={item.imgSrc}
                      draggable="false"
                      alt={item.imgAlt}
                      loading="lazy"
                    />
                    <p className={styles.itemlabel}>{item.label}</p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navigator;
