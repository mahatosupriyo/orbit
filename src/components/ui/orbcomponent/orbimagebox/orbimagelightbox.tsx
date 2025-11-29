"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import styles from "./orbimagelightbox.module.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import OrbIcons from "../../atomorb/orbicons";
import NumberFlow from "@number-flow/react";

/** Represents a single image in the lightbox */
type Img = { id: string | number; src: string; alt?: string };

/**
 * Props for the ImageLightbox component
 * @property images - Array of images to display
 * @property className - Optional CSS class for the preview grid
 * @property previewSize - Size of preview grid (px number or CSS value)
 * @property onClose - Callback triggered when lightbox closes
 */
type Props = {
    images: Img[];
    className?: string;
    previewSize?: number | string;
    onClose?: () => void;
};

/**
 * ImageLightbox Component
 *
 * A responsive, accessible image lightbox with keyboard navigation,
 * swiper support, and smooth animations using Framer Motion.
 *
 * Features:
 * - Grid preview thumbnails with responsive layouts (1-5+ images)
 * - Full-screen lightbox viewer with swipe/arrow navigation
 * - Keyboard support (Escape to close, Arrow keys to navigate)
 * - Body scroll lock when open
 * - Shared layout animations between preview and viewer
 *
 * @example
 * ```tsx
 * <ImageLightbox
 *   images={[{ id: 1, src: '/image1.jpg', alt: 'Photo 1' }]}
 *   previewSize="100%"
 *   onClose={() => console.log('closed')}
 * />
 * ```
 */
export default function ImageLightbox({
    images,
    className,
    previewSize = "100%",
    onClose,
}: Props) {
    // State management
    const [open, setOpen] = useState(false); // Lightbox open/closed state
    const [active, setActive] = useState(0); // Currently active slide index
    const overlayRef = useRef<HTMLDivElement | null>(null); // Reference to overlay for click handling
    const swiperRef = useRef<any>(null); // Reference to Swiper instance

    /**
     * Effect: Lock body scroll when lightbox is open
     * Prevents scroll on underlying content
     */
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    /**
     * Effect: Handle keyboard navigation
     * - Escape: Close lightbox
     * - ArrowLeft: Previous image
     * - ArrowRight: Next image
     */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeViewer();
            } else if (e.key === "ArrowLeft") {
                prev();
            } else if (e.key === "ArrowRight") {
                next();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /**
     * Open the lightbox at a specific image index
     * @param idx - Image index to display (default: 0)
     */
    function openViewer(idx = 0) {
        setActive(idx);
        setOpen(true);
        // Delayed slide transition to allow animation setup
        setTimeout(() => {
            try {
                swiperRef.current?.slideTo(idx, 0);
            } catch {
                // Safely handle Swiper API errors
            }
        }, 60);
    }

    /**
     * Close the lightbox and trigger optional callback
     */
    function closeViewer() {
        setOpen(false);
        onClose?.();
    }

    /**
     * Navigate to previous image
     */
    function prev() {
        try {
            swiperRef.current?.slidePrev();
        } catch {
            // Safely handle Swiper API errors
        }
    }

    /**
     * Navigate to next image
     */
    function next() {
        try {
            swiperRef.current?.slideNext();
        } catch {
            // Safely handle Swiper API errors
        }
    }

    /**
     * Generate unique layoutId for Framer Motion shared layout animations
     * @param id - Image ID
     * @returns Formatted layout identifier string
     */
    const layoutId = (id: string | number) => `lightbox-img-${id}`;

    /**
     * Determine CSS layout class based on image count
     * Provides responsive grid layouts for different image counts
     */
    const previewClass =
        images.length === 1
            ? styles.layout1
            : images.length === 2
                ? styles.layout2
                : images.length === 3
                    ? styles.layout3
                    : images.length === 4
                        ? styles.layout4
                        : styles.layout5plus;

    /**
     * Calculate maximum thumbnails to display
     * Currently shows all images; can be limited for performance
     */
    const maxThumbCountToShow = Math.max(images.length, 1);

    return (
        <>
            {/* Thumbnail Preview Grid */}
            <div
                className={`${styles.previewGrid} ${previewClass} ${className ?? ""}`}
                style={{ width: typeof previewSize === "number" ? `${previewSize}px` : previewSize }}
                role="list"
                aria-label="Image previews"
            >
                {images.slice(0, maxThumbCountToShow).map((img, i) => {
                    const extraCount = images.length - maxThumbCountToShow;
                    const showMoreOverlay = i === maxThumbCountToShow - 1 && extraCount > 0;
                    return (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            key={img.id}
                            className={styles.thumbBtn}
                            onClick={() => openViewer(i)}
                            type="button"
                            role="listitem"
                            aria-label={`Open image ${i + 1}`}
                        >
                            <motion.img
                                src={img.src}
                                alt={img.alt ?? `image-${i}`}
                                layoutId={layoutId(img.id)}
                                className={styles.thumbImg}
                                initial={{ opacity: 0.96 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.28 }}
                                draggable={false}
                            />
                            {showMoreOverlay && (
                                <div className={styles.moreOverlay}>+{extraCount}</div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Full-Screen Lightbox Overlay */}
            <AnimatePresence>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',

                    }}
                >

                    {open && (
                        <motion.div
                            className={styles.overlay}
                            ref={overlayRef}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(e) => {
                                // Close only when clicking the backdrop, not inner content
                                if (e.target === overlayRef.current) {
                                    closeViewer();
                                }
                            }}
                            aria-modal="true"
                            role="dialog"
                        >
                            {/* Top Navigation Bar */}
                            <div className={styles.toplayer}>
                                {/* <div style={{ width: '8.67rem' }}></div> */}
                                <p className={styles.page}>
                                    {/* <OrbIcons name="image" size={30} fill="#fff" aria-hidden="true" /> */}
                                    You're at
                                    <span className={styles.pagenumber}>
                                        <NumberFlow value={active + 1}/>
                                    </span>
                                    out
                                    of
                                    <span className={styles.pagenumber}>
                                        {images.length}
                                    </span>
                                </p>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className={styles.closeBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeViewer();
                                    }}
                                    aria-label="Close viewer"
                                >
                                    <span className={styles.key}>Esc</span>
                                    <OrbIcons name="close" size={20} />
                                </motion.button>
                            </div>

                            {/* Main Viewer Shell */}
                            <motion.div
                                className={styles.shell}
                                onClick={(e) => e.stopPropagation()}
                                initial={{ y: 6 }}
                                animate={{ y: 0 }}
                                exit={{ y: 6 }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className={styles.swiperWrapper}>
                                    {/* Previous Button - visible when not on first image */}
                                    {active > 0 && (
                                        <motion.button
                                            whileTap={{ scale: 0.9, opacity: '0.6', borderRadius: '10rem', transition: { duration: 0.1, ease: easeInOut } }}
                                            initial={{ opacity: 0, borderRadius: '0.2rem' }}
                                            animate={{ opacity: 1, borderRadius: '2.8rem' }}
                                            transition={{ delay: 0.4, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                            className={`${styles.customNavBtn} ${styles.customPrevBtn}`}
                                            aria-label="Previous image"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                prev();
                                            }}
                                        >
                                            <OrbIcons name="left" size={30} fill="#fff" />
                                        </motion.button>
                                    )}

                                    {/* Image Carousel - powered by Swiper */}
                                    <Swiper
                                        modules={[Navigation, Keyboard, Scrollbar]}
                                        navigation={false}
                                        className={styles.swiper}
                                        spaceBetween={0}
                                        scrollbar={{ draggable: true }}
                                        onSwiper={(s) => (swiperRef.current = s)}
                                        onSlideChange={(s) => setActive(s.activeIndex)}
                                        initialSlide={active}
                                    >
                                        {images.map((img) => (
                                            <SwiperSlide key={img.id}>
                                                <motion.img
                                                    src={img.src}
                                                    alt={img.alt ?? ""}
                                                    className={styles.slideImg}
                                                    layoutId={layoutId(img.id)}
                                                    initial={{ scale: 0.98, opacity: 0.96 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                                                    draggable={false}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    {/* Next Button - visible when not on last image */}
                                    {active < images.length - 1 && (
                                        <motion.button
                                            whileTap={{ scale: 0.96, opacity: '0.6', borderRadius: '10rem', transition: { duration: 0.1, ease: easeInOut } }}
                                            initial={{ opacity: 0, borderRadius: '0.2rem' }}
                                            animate={{ opacity: 1, borderRadius: '2.8rem' }}
                                            exit={{ opacity: 0, filter: 'blur(100px)' }}
                                            transition={{ delay: 0.4, duration: 0.02, ease: [0.22, 1, 0.36, 1] }}
                                            className={`${styles.customNavBtn} ${styles.customNextBtn}`}
                                            aria-label="Next image"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                next();
                                            }}
                                        >
                                            <OrbIcons name="right" size={30} fill="#fff" />
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>

            </AnimatePresence>
        </>
    );
}
