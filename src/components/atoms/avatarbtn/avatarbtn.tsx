'use client';

import React, { useState, useEffect, useRef } from "react";
import styles from './avatarbtn.module.scss';
import Logo from '@/components/atoms/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from "next-auth/react"
import Link from "next/link";
import { BuyNowButton } from "@/components/payments/paymentbtn";
import { useAvatarStore } from "@/app/store/avatarStore";
import { getAvatar } from "@/app/actions/getAvatar";
import AvatarImage from "../avatar/avatar";

const AvatarBtn: React.FC = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarUrl = useAvatarStore((state) => state.avatarUrl);
  const setAvatarUrl = useAvatarStore((state) => state.setAvatarUrl);

  useEffect(() => {
    if (avatarUrl) return;

    const fetchAvatar = async () => {
      try {
        const url = await getAvatar();
        setAvatarUrl(url);
      } catch (err) {
        console.error("Failed to fetch avatar:", err);
        setAvatarUrl('https://ontheorbit.com/placeholder.png');
      }
    };

    fetchAvatar();

  }, [avatarUrl, setAvatarUrl]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]); // only when menu is open

  return (
    <div className={styles.avatarbtncontainer} ref={menuRef}>
      <motion.button
        whileTap={{ opacity: 0.6, scale: 0.96 }}
        className={styles.avatarbtn}
        onClick={toggleMenu}
        aria-label="Open user menu"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        type="button"
      >
        <AvatarImage className={styles.avatar} />
      </motion.button>

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
                Settings
              </Link>

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
