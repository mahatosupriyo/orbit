"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import NumberFlow from "@number-flow/react";
import useHeartStore from "@/app/store/heartStore";
import styles from "./orbpost.module.scss";

/**
 * Props for the LikeButton component
 * @typedef {Object} Props
 * @property {number} [likes=0] - Current number of likes
 * @property {boolean} [isLiked=false] - Whether the post is liked by the current user
 * @property {() => void} [onLike] - Callback function when like button is clicked
 * @property {string} [postedAt] - Timestamp of when the post was created
 */
type Props = {
    likes?: number;
    isLiked?: boolean;
    onLike?: () => void;
    postedAt?: string | undefined;
};

/**
 * LikeButton Component
 * 
 * Renders an interactive like button with animations, particle effects, and sound feedback.
 * Manages optimistic UI updates for immediate user feedback while parent handles actual like state.
 * 
 * Features:
 * - Heart icon animation with scale and rotation
 * - Particle burst effect on like
 * - Floating hearts animation
 * - Sound effects via Zustand store
 * - Like count display with NumberFlow animation
 * - Accessibility attributes (aria-pressed, aria-label)
 * 
 * @component
 * @param {Props} props - Component props
 * @returns {JSX.Element} The rendered like button component
 * 
 * @example
 * <LikeButton 
 *   likes={42} 
 *   isLiked={true}
 *   onLike={() => handleLike()}
 *   postedAt="2 hours ago"
 * />
 */
export default function LikeButton({ likes = 0, isLiked = false, onLike, postedAt }: Props) {
    // Local liked state for optimistic UI
    const [localLiked, setLocalLiked] = useState<boolean>(!!isLiked);
    
    // Sync local state with parent prop changes
    useEffect(() => setLocalLiked(!!isLiked), [isLiked]);

    // Controls animation playback state
    const [playAnimation, setPlayAnimation] = useState<boolean>(false);
    
    // Particle data for burst effect
    const [particles, setParticles] = useState<{ id: number; angle: number }[]>([]);
    
    // Framer Motion controls for heart icon animation
    const heartControls = useAnimationControls();
    
    // Reference to cleanup timeout to prevent memory leaks
    const cleanupTimerRef = useRef<number | null>(null);

    // Sound effect player from Zustand store
    const playSound = useHeartStore((s) => s.play);

    /**
     * Cleanup effect: clears any pending timeouts on component unmount
     */
    useEffect(() => {
        return () => {
            if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
        };
    }, []);

    /**
     * Handles like button click with animations and sound effects
     * Updates local liked state, triggers animations, and calls parent callback
     */
    const handleLike = async () => {
        const newLiked = !localLiked;
        setLocalLiked(newLiked);

        try {
            if (onLike) onLike();
        } catch {
            // Silently catch parent errors to prevent breaking UI
        }

        if (newLiked) {
            // Play sound effect
            void playSound("bubblepop", "/Essentials/bubblepop.mp3");
            setPlayAnimation(true);

            // Generate 12 particles in a circle pattern
            const newParticles = Array.from({ length: 12 }, (_, i) => ({
                id: Date.now() + i,
                angle: (i * 360) / 12,
            }));
            setParticles(newParticles);

            // Animate heart icon: scale and rotate sequence
            await heartControls.start({
                scale: [1, 1.3, 0.9, 1.1, 1],
                rotate: [0, -10, 10, -5, 0],
                transition: { duration: 0.6, ease: "easeInOut" },
            });

            // Cleanup animation state after 900ms
            cleanupTimerRef.current = window.setTimeout(() => {
                setParticles([]);
                setPlayAnimation(false);
                cleanupTimerRef.current = null;
            }, 900);
        } else {
            // Animate heart on unlike: quick scale down and back
            heartControls.start({ scale: [1, 0.9, 1], transition: { duration: 0.18 } });
        }
    };

    /**
     * Calculate displayed like count with optimistic UI update
     * Adjusts count based on local vs parent liked state difference
     */
    const displayedLikes = likes + (localLiked === isLiked ? 0 : localLiked ? 1 : -1);

    return (
        <div className={styles.usercontrols}>
            <div className={styles.likecontrol} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {/* Like Button */}
                    <motion.button
                        className={`${styles.likebtn} ${localLiked ? styles.liked : ""}`}
                        aria-pressed={localLiked}
                        onClick={handleLike}
                        type="button"
                        aria-label={localLiked ? "Unlike" : "Like"}
                    >
                        <motion.div animate={heartControls} className={styles.heartContainer}>
                            {/* Heart Icon SVG */}
                            <svg className={styles.hearticon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 91 80" fill="none">
                                <motion.path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M44.151 79.3089C36.2565 74.4534 18.381 63.8709 8.06504 48.0389C-1.22796 33.7769 -1.67326 21.1439 2.60804 12.4299C6.00254 5.51969 12.4244 0.945891 20.014 0.128891C28.2249 -0.750019 37.576 2.81639 45.209 12.3559C52.8418 2.82069 62.193 -0.749109 70.404 0.128891C77.9978 0.945301 84.42 5.51949 87.81 12.4299C92.0873 21.1447 91.6459 33.7779 82.353 48.0349C72.029 63.8789 54.123 74.4799 46.24 79.3239C45.576 79.7341 44.7673 79.6989 44.1502 79.3083L44.151 79.3089Z"
                                    fill={localLiked ? "#ec4899" : "transparent"}
                                    animate={{ fill: localLiked ? "#ec4899" : "transparent" }}
                                    transition={{ duration: 0.28 }}
                                />
                            </svg>

                            {/* Ping/Burst Effect */}
                            {localLiked && playAnimation && (
                                <motion.div
                                    className={styles.likePing}
                                    initial={{ scale: 1, opacity: 0.8 }}
                                    animate={{ scale: 1.8, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "9999px",
                                        pointerEvents: "none",
                                        background: "radial-gradient(circle, hsla(330, 81%, 60%, 0.32) 0%, transparent 70%)",
                                    }}
                                />
                            )}
                        </motion.div>
                    </motion.button>

                    {/* Floating Hearts Animation */}
                    {playAnimation && localLiked && (
                        <>
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={`float-${i}`}
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: -6,
                                        width: 20,
                                        height: 20,
                                        marginLeft: -10,
                                        zIndex: 998,
                                        pointerEvents: "none",
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 91 80" fill="none" style={{ width: "100%", height: "100%" }}>
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

                {/* Like Count Display */}
                {displayedLikes > 0 && (
                    <span className={styles.liketext}>
                        <NumberFlow value={displayedLikes} />
                    </span>
                )}
            </div>

            {/* Posted Time Display */}
            <span className={styles.postedtime}>{postedAt ?? "Posted now"}</span>
        </div>
    );
}
