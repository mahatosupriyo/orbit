"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import Avatar from "./orbpublicavatar";
import ContentRenderer from "./contentrenderer";
import LikeButton from "./heartbtn";
import OrbIcons from "../../atomorb/orbicons";
import ImageLightbox from "../orbimagebox/orbimagelightbox";
import styles from "./orbpost.module.scss";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OrbGaragePostProps } from "@/types/garagepost";
import { formatTime } from "@/utils/time";

/**
 * OrbPost Component
 *
 * Renders Orbit media post with user information, content, images, and interactions.
 * Shows a "More" popover when the more button is clicked. Clicking outside or pressing
 * Escape closes the popover. The popover uses Framer Motion for animated enter/exit.
 *
 * Accessible and uses industry patterns for outside-click handling.
 */
export default function OrbPost(props: OrbGaragePostProps) {
  const {
    username,
    avatarUrl,
    content,
    postedAt,
    href = "/",
    images = [],
    likes = 0,
    isLiked = false,
    onLike,
  } = props;

  // State that controls the popover visibility
  const [moreOpen, setMoreOpen] = useState(false);

  // Refs for click/outside detection
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Toggle popover open state
  const toggleMore = useCallback(() => setMoreOpen((s) => !s), []);

  // Close popover helper
  const closeMore = useCallback(() => setMoreOpen(false), []);

  // When popover opens, move focus into it for keyboard users
  useEffect(() => {
    if (moreOpen) {
      // small timeout ensures the element exists in DOM (after render)
      const t = setTimeout(() => {
        popoverRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    } else {
      // return focus to the button when closing
      moreBtnRef.current?.focus();
    }
  }, [moreOpen]);

  // Close when clicking outside the popover or button, or pressing Escape
  useEffect(() => {
    if (!moreOpen) return;

    // Use the generic Event type so the same handler can be attached to mouse/touch events
    const onDocumentPointer = (e: Event) => {
      const target = (e.target as Node) || null;
      if (!target) return;
      // If click/touch is inside the popover or the button, ignore
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (moreBtnRef.current && moreBtnRef.current.contains(target)) return;
      // Click happened outside
      closeMore();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMore();
      }
    };

    document.addEventListener("mousedown", onDocumentPointer);
    document.addEventListener("touchstart", onDocumentPointer);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocumentPointer);
      document.removeEventListener("touchstart", onDocumentPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen, closeMore]);

  /**
   * Renders the popover content.
   * This can be extended later (share, copy link, download, report).
   */
  const PopoverContent = () => {

    return (
      <div className={styles.morePopoverInner} role="menu" aria-label="Post options">
        <div className={styles.sharedRow}>
          <div className={styles.sharedLabel}>Shared</div>
          <div className={styles.sharedDate} data-testid="shared-date">
            {postedAt}
          </div>
        </div>
      </div>
    );
  };


  // Framer Motion variants for the popover
  const popoverVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -6, scale: 0.98 },
  };

  return (
    <article
      className={styles.orbpost}
      aria-label={`Post by ${username}`}
      role="article"
    >
      <div className={styles.orbpostwraper}>
        {/* Main post container with user avatar and interaction area */}
        <div className={styles.layer}>
          {/* User avatar section */}
          <Avatar username={username} avatarUrl={avatarUrl} />

          {/* Post content wrapper */}
          <div className={styles.postcontent}>
            {/* Username and verification badge */}
            <div>
              <Link
                draggable={false}
                href={href}
                className={styles.username}
                aria-label={`View ${username}'s profile`}
              >
                {username}
                <OrbIcons name="verified" size={12} aria-hidden="true" />
              </Link>
            </div>

            {/* Rendered post text content */}
            <div className={styles.poststory}>
              <ContentRenderer content={content} />
            </div>

            {/* Post images gallery - conditionally rendered */}
            {images.length > 0 && (
              <div className={styles.postImages}>
                <ImageLightbox
                  images={images}
                  className={styles.postImagePreview}
                  aria-label={`Post images (${images.length} image${images.length !== 1 ? "s" : ""})`}
                />
              </div>
            )}

            {/* Like button and post timestamp */}
            <LikeButton
              likes={likes}
              isLiked={isLiked}
              onLike={onLike}
              postedAt={postedAt}
            />
          </div>

          <div className={styles.moreiconwraper}>
            {/* More options menu button with animation feedback */}
            <motion.button
              whileTap={{ scale: 0.98, opacity: 0.6 }}
              aria-label="More options"
              className={styles.moreicon}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              type="button"
              onClick={toggleMore}
              ref={moreBtnRef}
              // small animate to give tactile feedback on open/close
              animate={{ rotate: moreOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <OrbIcons name="more" size={26} fill="#fff" aria-hidden="true" />
            </motion.button>

            {/* Popover — animated with Framer Motion via AnimatePresence */}
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  ref={popoverRef}
                  className={styles.morePopover}
                  role="dialog"
                  aria-modal="false"
                  tabIndex={-1}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={popoverVariants}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      closeMore();
                    }
                  }}
                >
                  <PopoverContent />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </article>
  );
}
