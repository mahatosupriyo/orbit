"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from './avatarbtn.module.scss';
import Logo from '@/components/atoms/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Overlay from "@/components/overlay/overlay";
import { useSession, signOut } from "next-auth/react"
import Link from "next/link";

/**
 * AvatarBtn Component
 * Renders a user avatar button with a dropdown menu.
 * Handles menu open/close, click outside to close, and simple menu options.
 * Uses the session's user image for the avatar.
 */
const AvatarBtn: React.FC = () => {
  const { data: session } = useSession();

  // State to control dropdown menu visibility
  const [menuOpen, setMenuOpen] = useState(false);

  // Ref for the menu container to detect outside clicks
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle the dropdown menu open/close
  const toggleMenu = () => setMenuOpen(prev => !prev);

  // Close the menu if a click occurs outside the menu container
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
        <img
          className={styles.avatar}
          src={session?.user?.image || "https://via.placeholder.com/40"}
          alt="User Avatar"
          draggable="false"
        />
      </motion.button>

      {/* Dropdown menu with animation */}
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
                this is pro
                <br /><br /><br /><br />
              </Overlay>

              <motion.button whileTap={{ opacity: 0.6 }} className={styles.option}>
                <Logo name="help" fill="#121212" size={24} />
                Help center
              </motion.button>
              <motion.button whileTap={{ opacity: 0.6 }} className={styles.option}>
                <Logo name="bill" fill="#121212" size={24} />
                Payments
              </motion.button>
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