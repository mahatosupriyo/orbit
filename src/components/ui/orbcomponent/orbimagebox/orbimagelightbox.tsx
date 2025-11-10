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
    const first = images && images.length > 0 ? images[0] : null;
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const swiperRef = useRef<any>(null);
    const thumbRef = useRef<HTMLDivElement | null>(null);

    // lock scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // keyboard escape close
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

        // allow swiper to mount then jump to index
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

    return (
        <>
            {/* thumbnail preview */}
            <motion.div
                whileTap={{ scale: 0.98 }}
                className={`${styles.lightboxPreview} ${className ?? ""}`}
                onClick={() => first && openViewer(0)}
                style={{ width: typeof previewSize === "number" ? `${previewSize}px` : previewSize }}
                role="button"
                aria-label="Open image viewer"
                ref={thumbRef}
            >
                {first && (
                    <motion.img
                        src={first.src}
                        alt={first.alt ?? ""}
                        layoutId={layoutId(first.id)}
                        initial={{ opacity: 0.96 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                        draggable={false}
                    />
                )}
            </motion.div>

            {/* overlay + reveal */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className={styles.overlay}
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => closeViewer()} // clicking the overlay closes
                    >
                        {/* top bar */}
                        <div className={styles.toplayer}>
                            <div style={{ width: "4.2rem" }} />
                            <p className={styles.page}>
                                {active + 1} of {images.length}
                            </p>
                            <button className={styles.closeBtn} onClick={(e) => { e.stopPropagation(); closeViewer(); }} aria-label="Close viewer">
                                <OrbIcons name="close" size={20} />
                            </button>
                        </div>

                        {/* stop propagation on shell so clicks inside do not close */}
                        <motion.div
                            className={styles.shell}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ y: 6 }}
                            animate={{ y: 0 }}
                            exit={{ y: 6 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className={styles.swiperWrapper}>

                                {/* Custom Prev button (absolute) */}
                                <motion.button
                                    whileTap={{ scale: 0.96, opacity: '0.6', borderRadius: '1rem' }}
                                    className={`custom-prev ${styles.customNavBtn} ${styles.customPrevBtn}`}
                                    aria-label="Previous image"
                                    initial={{ opacity: 0, borderRadius: '0.2rem' }}
                                    animate={{ opacity: 1, borderRadius: '2.8rem' }}
                                    transition={{ delay: 0.4, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    onClick={(e) => { e.stopPropagation(); prev(); }}
                                >
                                    <OrbIcons name="left" size={30} fill="#fff" />
                                </motion.button>

                                {/* Swiper */}
                                <Swiper
                                    modules={[Navigation, Keyboard, Scrollbar]}
                                    navigation={false} // we use our own controls
                                    className={styles.swiper}
                                    loop={true}
                                    keyboard={{ enabled: true }}
                                    scrollbar={{ draggable: true }}
                                    onSwiper={(s) => (swiperRef.current = s)}
                                    onSlideChange={(s) => setActive(s.activeIndex)}
                                    initialSlide={active}
                                    style={{ width: "100%" }}
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

                                {/* Custom Next button (absolute) */}
                                <motion.button
                                    whileTap={{ scale: 0.96, opacity: '0.6', borderRadius: '1rem' }}

                                    initial={{ opacity: 0, borderRadius: '0.2rem' }}
                                    animate={{ opacity: 1, borderRadius: '2.8rem' }}
                                    transition={{ delay: 0.4, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    className={`custom-next ${styles.customNavBtn} ${styles.customNextBtn}`}
                                    aria-label="Next image"
                                    onClick={(e) => { e.stopPropagation(); next(); }}
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
