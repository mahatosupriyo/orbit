"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./orbimagelightbox.module.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import OrbIcons from "../../atomorb/orbicons";

type Img = { id: string | number; src: string; alt?: string };

type Props = {
    images: Img[];
    className?: string;
    previewSize?: number | string; // px number or CSS value like "100%"
    onClose?: () => void;
};

export default function ImageLightbox({
    images,
    className,
    previewSize = "100%",
    onClose,
}: Props) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const swiperRef = useRef<any>(null);

    // lock scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // keyboard handling (escape + arrows)
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

    function openViewer(idx = 0) {
        setActive(idx);
        setOpen(true);
        setTimeout(() => {
            try {
                swiperRef.current?.slideTo(idx, 0);
            } catch {
                // ignore
            }
        }, 60);
    }

    function closeViewer() {
        setOpen(false);
        onClose?.();
    }

    function prev() {
        try {
            swiperRef.current?.slidePrev();
        } catch {
            // ignore
        }
    }

    function next() {
        try {
            swiperRef.current?.slideNext();
        } catch {
            // ignore
        }
    }

    const layoutId = (id: string | number) => `lightbox-img-${id}`;

    // preview grid choice class
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

    // show at most N thumbnails in grid display, optionally you can show all; currently show all but for better UX for many images we let layout handle overflow
    const maxThumbCountToShow = Math.max(images.length, 1);

    return (
        <>
            {/* thumbnails grid preview */}
            <div
                className={`${styles.previewGrid} ${previewClass} ${className ?? ""}`}
                style={{ width: typeof previewSize === "number" ? `${previewSize}px` : previewSize }}
                role="list"
                aria-label="Image previews"
            >
                {images.slice(0, maxThumbCountToShow).map((img, i) => {
                    // for very large image counts you may want to show a +N overlay on last item; here we show all but provide a hook:
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

            {/* overlay (full viewer) */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className={styles.overlay}
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => {
                            // close when clicking backdrop (but not when click inside shell)
                            if (e.target === overlayRef.current) {
                                closeViewer();
                            }
                        }}
                        aria-modal="true"
                        role="dialog"
                    >
                        {/* top bar */}
                        <div className={styles.toplayer}>
                            <div style={{ width: "5.2rem" }} />
                            <p className={styles.page}>
                                {active + 1} of {images.length}
                            </p>
                            <button
                                className={styles.closeBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeViewer();
                                }}
                                aria-label="Close viewer"
                            >
                                <OrbIcons name="close" size={20} />
                            </button>
                        </div>

                        {/* shell */}
                        <motion.div
                            className={styles.shell}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ y: 6 }}
                            animate={{ y: 0 }}
                            exit={{ y: 6 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className={styles.swiperWrapper}>
                                {/* prev */}
                                <motion.button
                                    whileTap={{ scale: 0.96, opacity: '0.6', borderRadius: '1rem' }} initial={{ opacity: 0, borderRadius: '0.2rem' }} animate={{ opacity: 1, borderRadius: '2.8rem' }} transition={{ delay: 0.4, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    className={`${styles.customNavBtn} ${styles.customPrevBtn}`}
                                    aria-label="Previous image"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prev();
                                    }}
                                >
                                    <OrbIcons name="left" size={30} fill="#fff" />
                                </motion.button>

                                {/* Swiper viewer */}
                                <Swiper
                                    modules={[Navigation, Keyboard, Scrollbar]}
                                    navigation={false}
                                    className={styles.swiper}
                                    // keyboard={{ enabled: true }}
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

                                {/* next */}
                                <motion.button
                                    whileTap={{ scale: 0.96, opacity: '0.6', borderRadius: '1rem' }} initial={{ opacity: 0, borderRadius: '0.2rem' }} animate={{ opacity: 1, borderRadius: '2.8rem' }} transition={{ delay: 0.4, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    className={`${styles.customNavBtn} ${styles.customNextBtn}`}
                                    aria-label="Next image"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        next();
                                    }}
                                >
                                    <OrbIcons name="right" size={30} fill="#fff" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
