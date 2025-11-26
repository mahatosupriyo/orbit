"use client";

import React, { useState, useEffect, useRef } from "react";
import { easeInOut, motion, useAnimationControls } from "framer-motion";
import OrbIcons from '../../atomorb/orbicons';
import styles from "./orbpost.module.scss";
import Link from "next/link";
import ImageLightbox from "../orbimagebox/orbimagelightbox";
import NumberFlow from "@number-flow/react";

export interface OrbPostProps {
  username: string;
  avatarUrl?: string;
  content: string;
  href?: string;
  images?: { id: string | number; src: string; alt?: string }[];
  likes?: number;
  isLiked?: boolean;
  onLike?: () => void;
  postedAt?: string;
}

const FALLBACK_AVATAR = "https://ontheorbit.com/placeholder.png";

const urlRegex =
  /((https?:\/\/[^\s<>]+)|(www\.[^\s<>]+)|([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}(?:\/[^\s<>]*)?))/ig;

function prettyUrl(raw: string) {
  try {
    return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  } catch {
    return raw;
  }
}

function pushTextWithBreaks(nodes: React.ReactNode[], text: string, keyPrefix: string) {
  const pieces = text.split("\n");
  pieces.forEach((piece, idx) => {
    nodes.push(<React.Fragment key={`${keyPrefix}-${idx}`}>{piece}</React.Fragment>);
    if (idx < pieces.length - 1) {
      nodes.push(<br key={`${keyPrefix}-br-${idx}`} />);
    }
  });
}

function makeHref(raw: string) {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  return `https://${raw}`;
}

function renderContent(text: string): React.ReactNode {
  if (!text) return null;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const cleaned = normalized.replace(/#\^#(.*?)#\^#/g, "$1");
  const paragraphs = cleaned.split(/\n{2}/);

  return paragraphs.map((para, pIndex) => {
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let matchIndex = 0;

    const regex = new RegExp((urlRegex as RegExp).source, (urlRegex as RegExp).flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(para)) !== null) {
      const match = m[0];
      const start = m.index;

      if (start > lastIndex) {
        pushTextWithBreaks(nodes, para.substring(lastIndex, start), `t-${pIndex}-${matchIndex}-before`);
      }

      const href = makeHref(match);
      nodes.push(
        <a
          key={`link-${pIndex}-${matchIndex}`}
          href={href}
          style={{
            textDecoration: 'none',
            color: '#1B90D6',
            fontWeight: 500,
          }}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.inlineLink}
        >
          {prettyUrl(match)}
        </a>
      );

      lastIndex = start + match.length;
      matchIndex++;
    }

    if (lastIndex < para.length) {
      pushTextWithBreaks(nodes, para.substring(lastIndex), `t-${pIndex}-last`);
    }

    return (
      <p key={`para-${pIndex}`} className={styles.postParagraph}>
        {nodes}
      </p>
    );
  });
}

type Particle = { id: number; angle: number };

export default function OrbPost({
  username,
  avatarUrl = FALLBACK_AVATAR,
  content,
  postedAt,
  href = "/",
  images = [],
  likes = 0,
  isLiked = false,
  onLike,
}: OrbPostProps) {
  const renderedContent = renderContent(content);

  // Local state to allow the fancy animation while still supporting a controlled prop
  const [localLiked, setLocalLiked] = useState<boolean>(!!isLiked);
  useEffect(() => {
    setLocalLiked(!!isLiked);
  }, [isLiked]);

  // New: only play the animation when the user explicitly likes (not on initial mount)
  const [playAnimation, setPlayAnimation] = useState<boolean>(false);

  const [particles, setParticles] = useState<Particle[]>([]);
  const heartControls = useAnimationControls();
  const cleanupTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // cleanup any pending timers on unmount
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
  }, []);

  const handleLike = async () => {
    const newLiked = !localLiked;
    setLocalLiked(newLiked);

    // Call external handler if present
    try {
      if (onLike) onLike();
    } catch (e) {
      // swallow errors from parent handler — animation should remain responsive
    }

    if (newLiked) {
      // mark we should play the animation (only for this click)
      setPlayAnimation(true);

      // spawn particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 360) / 12,
      }));
      setParticles(newParticles);

      // heartbeat animation using animation controls
      await heartControls.start({
        scale: [1, 1.3, 0.9, 1.1, 1],
        rotate: [0, -10, 10, -5, 0],
        transition: { duration: 0.6, ease: easeInOut },
      });

      // clear particles and stop playAnimation after the animation finishes
      cleanupTimerRef.current = window.setTimeout(() => {
        setParticles([]);
        setPlayAnimation(false);
        cleanupTimerRef.current = null;
      }, 900); // slightly longer than the particle animation
    } else {
      // Small un-like feedback (no particle spawn)
      heartControls.start({ scale: [1, 0.9, 1], transition: { duration: 0.18 } });
    }
  };

  // Calculate displayed likes optimistically so UI reacts immediately
  const displayedLikes = likes + (localLiked === isLiked ? 0 : (localLiked ? 1 : -1));

  return (
    <article className={styles.orbpost} aria-label={`Post by ${username}`}>
      <div className={styles.orbpostwraper}>
        <div className={styles.layer}>
          <div className={styles.avatarwraper}>
            <img
              draggable={false}
              src={avatarUrl || FALLBACK_AVATAR}
              alt={`${username} avatar`}
              className={styles.avatar}
            />
            <div className={styles.line}></div>
          </div>

          <div className={styles.postcontent}>
            <div>
              <Link draggable={false} href={href} className={styles.username}>
                {username}
                <OrbIcons name="verified" size={12} />
              </Link>
            </div>

            <div className={styles.poststory}>{renderedContent}</div>

            {images.length > 0 && (
              <div className={styles.postImages}>
                <ImageLightbox images={images} className={styles.postImagePreview} />
              </div>
            )}

            <div className={styles.usercontrols}>
              <div className={styles.likecontrol} style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>

                {/* wrapper to position particles absolutely relative to the button */}
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                  <motion.button
                    // whileTap={{ scale: 0.8 }}
                    className={`${styles.likebtn} ${localLiked ? styles.liked : ""}`}
                    aria-pressed={localLiked}
                    onClick={handleLike}
                    type="button"
                    aria-label={localLiked ? "Unlike" : "Like"}
                  >
                    <motion.div animate={heartControls} className={styles.heartContainer}>
                      <svg
                        className={styles.hearticon}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 91 80"
                        fill="none">
                        <motion.path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M44.151 79.3089C36.2565 74.4534 18.381 63.8709 8.06504 48.0389C-1.22796 33.7769 -1.67326 21.1439 2.60804 12.4299C6.00254 5.51969 12.4244 0.945891 20.014 0.128891C28.2249 -0.750019 37.576 2.81639 45.209 12.3559C52.8418 2.82069 62.193 -0.749109 70.404 0.128891C77.9978 0.945301 84.42 5.51949 87.81 12.4299C92.0873 21.1447 91.6459 33.7779 82.353 48.0349C72.029 63.8789 54.123 74.4799 46.24 79.3239C45.576 79.7341 44.7673 79.6989 44.1502 79.3083L44.151 79.3089Z"
                          fill={localLiked ? "#ec4899" : "transparent"}
                          animate={{ fill: localLiked ? "#ec4899" : "transparent" }}
                          transition={{ duration: 0.28 }}
                        />
                      </svg>

                      {/* Ping effect — only shown when playAnimation is true */}
                      {localLiked && playAnimation && (
                        <motion.div
                          className={styles.likePing}
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '9999px',
                            pointerEvents: 'none',
                            background: 'radial-gradient(circle, hsla(330, 81%, 60%, 0.32) 0%, transparent 70%)'
                          }}
                        />
                      )}

                    </motion.div>

                  </motion.button>

                  {/* Floating hearts — only show when playAnimation is true */}
                  {playAnimation && localLiked && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={`float-${i}`}
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: -6,
                            width: 20,
                            height: 20,
                            marginLeft: -10,
                            pointerEvents: 'none',
                          }}
                          initial={{ y: 0, x: -12 + (i - 1) * 30, opacity: 0, scale: 0 }}
                          animate={{
                            y: -80,
                            x: -12 + (i - 1) * 30,
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0.5],
                          }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 91 80" fill="none" style={{ width: '100%', height: '100%' }}>
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M44.151 79.3089C36.2565 74.4534 18.381 63.8709 8.06504 48.0389C-1.22796 33.7769 -1.67326 21.1439 2.60804 12.4299C6.00254 5.51969 12.4244 0.945891 20.014 0.128891C28.2249 -0.750019 37.576 2.81639 45.209 12.3559C52.8418 2.82069 62.193 -0.749109 70.404 0.128891C77.9978 0.945301 84.42 5.51949 87.81 12.4299C92.0873 21.1447 91.6459 33.7779 82.353 48.0349C72.029 63.8789 54.123 74.4799 46.24 79.3239C45.576 79.7341 44.7673 79.6989 44.1502 79.3083L44.151 79.3089Z"
                              fill="#ec4899"
                            />
                          </svg>
                        </motion.div>
                      ))}
                    </>
                  )}

                </div>

                {displayedLikes > 0 && (
                  <span className={styles.liketext}>
                    <NumberFlow value={displayedLikes} />
                  </span>
                )}
              </div>

              <span className={styles.postedtime}>
                {postedAt ?? "Posted now"}
              </span>

            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98, opacity: 0.6 }}
            className={styles.moreicon}
            aria-label="More options"
            type="button"
          >
            {/* more */}
            <OrbIcons name="more" size={22} fill="#929292" />
          </motion.button>
        </div>
      </div>
    </article>
  );
}
