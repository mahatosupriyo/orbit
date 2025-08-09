"use client";
import React from "react";
import styles from "./navigator.module.scss";
import Link from "next/link";
import Icon from "@/components/atoms/icons";
import { usePathname } from "next/navigation";
import { motion } from 'framer-motion'
import { useSession } from "next-auth/react";

/**
 * Navigator component renders navigation buttons for the main pages.
 * Highlights the active page based on the current pathname.
 */
const Navigator: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  /**
   * Helper to determine if a link is active.
   * @param path - The path to check against the current pathname.
   * @returns Boolean indicating if the link is active.
   */
  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.mainnavigatorcontainer} aria-label="Main Navigation">

      <motion.div
        whileTap={{ opacity: 0.6, scale: 0.96 }}
      >
        <Link
          href="/astra"
          className={`${styles.pagebtn} ${isActive("/astra") ? styles.active : ""}`}
          aria-current={isActive("/astra") ? "page" : undefined}
          tabIndex={0}
        >
          <Icon
            name="activesearch"
            size={28}
            fill={isActive("/astra") ? "#fafafa" : "#666"}
            aria-label="Astra"
          />
        </Link>
      </motion.div>

      {/* Garage Page Link */}



      <motion.div
        whileTap={{ opacity: 0.6, scale: 0.96 }}
      >
        <Link
          href="/garage"
          className={`${styles.pagebtn} ${isActive("/garage") ? styles.active : ""}`}
          aria-current={isActive("/garage") ? "page" : undefined}
          tabIndex={0}
        >
          <Icon
            name="garage"
            size={28}
            fill={isActive("/garage") ? "#fafafa" : "#666"}
            aria-label="Garage"
          />
        </Link>
      </motion.div>



      {/* Garage Page Link */}
      {session?.user.role === "ADMIN" && (

        <motion.div
          whileTap={{ opacity: 0.6, scale: 0.96 }}
        >
          <Link
            href="/create"
            className={`${styles.pagebtn} ${isActive("/create") ? styles.active : ""}`}
            aria-current={isActive("/create") ? "page" : undefined}
            tabIndex={0}
          >
            <Icon
              name="upload"
              size={28}
              fill={isActive("/create") ? "#fafafa" : "#666"}
              aria-label="Create"
            />
          </Link>
        </motion.div>

      )}

      {/* Odyssey Page Link */}
      <motion.div
        whileTap={{ opacity: 0.6, scale: 0.96 }}
      >
        <Link
          href="/odyssey"
          className={`${styles.pagebtn} ${isActive("/odyssey") ? styles.active : ""}`}
          aria-current={isActive("/odyssey") ? "page" : undefined}
          tabIndex={0}
        >
          <Icon
            name="series"
            size={28}
            fill={isActive("/odyssey") ? "#fafafa" : "#666"}
            aria-label="Odyssey"
          />
        </Link>
      </motion.div>

    </nav>
  );
};

export default Navigator;
