"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./orbimagelightbox.module.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import OrbIcons from "../../atomorb/orbicons"; // Adjust path if needed
import NumberFlow from "@number-flow/react";

type Img = { id: string | number; src: string; alt?: string };

type Props = {
    images: Img[];
    className?: string;
    previewSize?: number | string;
    onClose?: () => void;
};

// Helper: Convert any image blob to PNG (Required for Clipboard API support)
const convertToPng = (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Canvas context failed"));
                return;
            }

            // Draw image to canvas
            ctx.drawImage(img, 0, 0);

            // Export as PNG
            canvas.toBlob((pngBlob) => {
                if (pngBlob) {
                    resolve(pngBlob);
                } else {
                    reject(new Error("PNG conversion failed"));
                }
                URL.revokeObjectURL(url);
            }, "image/png");
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image for conversion"));
        };

        img.src = url;
    });
};

export default function ImageLightbox({
    images,
    className,
    previewSize = "100%",
    onClose,
}: Props) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);

    // UI States for the copy button
    const [isCopying, setIsCopying] = useState(false);
    const [copied, setCopied] = useState(false);

    const overlayRef = useRef<HTMLDivElement | null>(null);
    const swiperRef = useRef<any>(null);

    // Lock body scroll
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // Keyboard support
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeViewer();
            else if (e.key === "ArrowLeft") prev();
            else if (e.key === "ArrowRight") next();
            else if ((e.metaKey || e.ctrlKey) && e.key === "c") {
                e.preventDefault();
                handleCopyImage();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [active, open]);

    function openViewer(idx = 0) {
        setActive(idx);
        setOpen(true);
        setTimeout(() => {
            try { swiperRef.current?.slideTo(idx, 0); } catch { }
        }, 60);
    }

    function closeViewer() {
        setOpen(false);
        setCopied(false);
        onClose?.();
    }

    function prev() { try { swiperRef.current?.slidePrev(); } catch { } }
    function next() { try { swiperRef.current?.slideNext(); } catch { } }

    /**
     * Copies the CURRENTLY ACTIVE image to clipboard as PNG
     */
    const handleCopyImage = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (isCopying) return;

        setIsCopying(true);
        setCopied(false);

        try {
            const currentImg = images[active];
            if (!currentImg) throw new Error("No image selected");

            // 1. Fetch original image (Bypass CORS cache)
            const response = await fetch(currentImg.src, {
                mode: "cors",
                cache: "no-store"
            });

            if (!response.ok) throw new Error("Failed to fetch image");

            const originalBlob = await response.blob();
            let blobToWrite = originalBlob;

            // 2. Convert to PNG if it isn't already (Browsers require PNG for clipboard)
            if (originalBlob.type !== "image/png") {
                blobToWrite = await convertToPng(originalBlob);
            }

            // 3. Write PNG Blob to Clipboard
            await navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blobToWrite
                })
            ]);

            // 4. Success Feedback
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

        } catch (err) {
            console.error("Failed to copy image:", err);
            alert("Could not copy image. Please try downloading instead.");
        } finally {
            setIsCopying(false);
        }
    };

    const layoutId = (id: string | number) => `lightbox-img-${id}`;

    // Layout logic
    const previewClass =
        images.length === 1 ? styles.layout1 :
            images.length === 2 ? styles.layout2 :
                images.length === 3 ? styles.layout3 :
                    images.length === 4 ? styles.layout4 : styles.layout5plus;

    const maxThumbCountToShow = Math.max(images.length, 1);

    return (
        <>
            {/* Thumbnail Preview Grid */}
            <div
                className={`${styles.previewGrid} ${previewClass} ${className ?? ""}`}
                style={{ width: typeof previewSize === "number" ? `${previewSize}px` : previewSize }}
                role="list"
            >
                {images.slice(0, maxThumbCountToShow).map((img, i) => {
                    const extraCount = images.length - maxThumbCountToShow;
                    const showMoreOverlay = i === maxThumbCountToShow - 1 && extraCount > 0;
                    return (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.01 }}
                            key={img.id}
                            className={styles.thumbBtn}
                            onClick={() => openViewer(i)}
                            type="button"
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
                {open && (
                    <motion.div
                        className={styles.overlay}
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => {
                            if (e.target === overlayRef.current) closeViewer();
                        }}
                        role="dialog"
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',

                                position: 'absolute',
                                top: '0',
                                // zIndex: 10,
                            }}
                            className={styles.toplayer}
                        >

                            {/* Page Counter */}
                            <p className={styles.page}>
                                <span className={styles.pagenumber}>
                                    <NumberFlow value={active + 1} />
                                </span>{" "}
                                out of{" "}
                                <span className={styles.pagenumber}>
                                    <NumberFlow value={images.length} />
                                </span>
                            </p>


                            {/* COPY IMAGE BUTTON */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className={styles.closeBtn}
                                onClick={handleCopyImage}
                                disabled={isCopying}

                                aria-label="Copy image"
                                title="Copy image to clipboard"
                                style={{
                                    color: copied ? "#4ade80" : "#fff",
                                    cursor: isCopying ? "wait" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    userSelect: 'none',

                                    // padding: 0,
                                    borderRadius: '2rem',
                                    fontWeight: 600,
                                    padding: '0rem 1.4rem 0rem 0.6rem',

                                    height: '5.4rem',
                                    marginLeft: '1rem'
                                    // width: '5.4rem',
                                }}
                            >
                                {isCopying ? (
                                    // Loading Spinner
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',

                                            height: '30px',
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                justifyContent: 'center',

                                                height: '30px',
                                                width: '30px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "14px",
                                                    height: "14px",
                                                    border: "2px solid rgba(255,255,255,0.3)",
                                                    borderTopColor: "currentColor",
                                                    borderRadius: "50%",
                                                    animation: "spin 1s linear infinite",
                                                }}
                                            />
                                        </div>
                                        Copying
                                    </div>
                                ) : copied ? (
                                    // Success Checkmark
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <OrbIcons name="copyimage" size={30} fill="#4ade80" />
                                        Copied
                                    </div>
                                ) : (
                                    // Default Copy Icon
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <OrbIcons name="copyimage" size={30} fill="#fff" />
                                        Copy
                                    </div>
                                )}

                                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </motion.button>



                            {/* Actions Group */}
                            <div>

                                {/* CLOSE BUTTON */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className={styles.closeBtn}
                                    style={{
                                        height: '5.4rem',
                                        borderRadius: '2rem'
                                    }}
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
                                {active > 0 && (
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        initial={{ opacity: 0, borderRadius: "0.2rem" }}
                                        animate={{ opacity: 1, borderRadius: "2.8rem" }}
                                        transition={{ delay: 0.4, duration: 0.2 }}
                                        className={`${styles.customNavBtn} ${styles.customPrevBtn}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prev();
                                        }}
                                    >
                                        <OrbIcons name="left" size={30} fill="#fff" />
                                    </motion.button>
                                )}

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
                                                onContextMenu={(e) => e.preventDefault()}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {active < images.length - 1 && (
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        initial={{ opacity: 0, borderRadius: "0.2rem" }}
                                        animate={{ opacity: 1, borderRadius: "2.8rem" }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: 0.4, duration: 0.02 }}
                                        className={`${styles.customNavBtn} ${styles.customNextBtn}`}
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
            </AnimatePresence>
        </>
    );
}