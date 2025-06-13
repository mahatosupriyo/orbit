"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from './avatarbtn.module.scss';
import Logo from '@/components/atoms/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Overlay from "@/components/overlay/overlay";
import { useSession, signOut } from "next-auth/react"
import Link from "next/link";
import { BuyNowButton } from "@/components/payments/paymentbtn";
import Icon from "@/components/atoms/icons";

/**
 * AvatarBtn Component
 * Renders a user avatar button with a dropdown menu.
 * Handles menu open/close, click outside to close, and simple menu options.
 * Uses the session's user image for the avatar.
 */
const AvatarBtn: React.FC = () => {
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Loading states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        setShowImage(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <div className={styles.avatarbtncontainer} ref={menuRef}>
      {/* Avatar button */}
      <motion.button
        whileTap={{ opacity: 0.6, scale: 0.96 }}
        className={styles.avatarbtn}
        onClick={toggleMenu}
        aria-label="Open user menu"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        type="button"
      >
        {/* Skeleton Loader */}
        {!showImage && (
          <div className={styles.skeleton}></div>
        )}
        <img
          className={`${styles.avatar} ${showImage ? styles.fadeIn : styles.hidden}`}
          src={session?.user?.image || '/'}
          draggable="false"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ul className={styles.menu}>
              <Link href="/account" className={styles.option}>
                <Logo name="account" fill="#121212" size={24} />
                Account settings
              </Link>

              <Overlay
                buttonIcon={<Logo name="otostroke" fill="#121212" size={24} />}
                buttonText="Orbit Pro"
              >

                <div className={styles.wraperplans}>
                  <h1 className={styles.title}>Upgrade your plan</h1>

                  <div className={styles.planbtns}>
                    <BuyNowButton
                      plan="pro"
                      amount={6499}
                      description="Pro Plan for On The Orbit"
                      buttonLabel="Pro"
                    />

                    <BuyNowButton
                      plan="exclusive"
                      amount={14999}
                      description="Pro Plan for On The Orbit"
                      buttonLabel="Exclusive"
                    />
                  </div>
                </div>
              </Overlay>

              <motion.button whileTap={{ opacity: 0.6 }} className={styles.option}>
                <Logo name="help" fill="#121212" size={24} />
                Help center
              </motion.button>
              <Link href="/payment/history" className={styles.option}>
                <Logo name="bill" fill="#121212" size={24} />
                Payments
              </Link>
              <hr className={styles.hr} />
              <motion.button onClick={() => signOut()} whileTap={{ opacity: 0.6 }} className={styles.logout}>
                Logout
              </motion.button>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvatarBtn;
