"use client";
import React from "react";
import styles from "./navigator.module.scss";
import Link from "next/link";
import Icon from "@/components/atoms/icons";
import { usePathname } from "next/navigation";

/**
 * Navigator component renders navigation buttons for the main pages.
 * Highlights the active page based on the current pathname.
 */
const Navigator: React.FC = () => {
  const pathname = usePathname();

  /**
   * Helper to determine if a link is active.
   * @param path - The path to check against the current pathname.
   * @returns Boolean indicating if the link is active.
   */
  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.mainnavigatorcontainer} aria-label="Main Navigation">
      {/* Garage Page Link */}
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

      {/* Odyssey Page Link */}
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
    </nav>
  );
};

export default Navigator;
