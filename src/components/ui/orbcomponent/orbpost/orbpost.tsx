"use client";
import React from "react";
import Avatar from "./orbpublicavatar";
import ContentRenderer from "./contentrenderer";
import LikeButton from "./heartbtn";
import OrbIcons from "../../atomorb/orbicons";
import ImageLightbox from "../orbimagebox/orbimagelightbox";
import styles from "./orbpost.module.scss";
import Link from "next/link";
import { motion } from "framer-motion";
import { OrbGaragePostProps } from "@/types/garagepost";

/**
 * OrbPost Component
 * 
 * Renders Orbit media post with user information, content, images, and interactions.
 * Provides visual feedback through animations and accessible UI patterns.
 * 
 * @component
 * @example
 * <OrbPost
 *   username="john_doe"
 *   avatarUrl="https://..."
 *   content="Hello world!"
 *   postedAt="2024-01-15T10:30:00Z"
 *   href="/profile/john_doe"
 *   images={[...]}
 *   likes={42}
 *   isLiked={false}
 *   onLike={() => console.log('liked')}
 * />
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
                  aria-label={`Post images (${images.length} image${images.length !== 1 ? 's' : ''})`}
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

          {/* More options menu button with animation feedback */}
          <motion.button
            whileTap={{ scale: 0.98, opacity: 0.6 }}
            className={styles.moreicon}
            aria-label="More options"
            aria-haspopup="menu"
            type="button"
          >
            <OrbIcons name="more" size={28} fill="#929292" aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </article>
  );
}
