"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./orbpost.module.scss";

type PostMorePopoverProps = {
    open: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement>; // the "more" button
    postedAt: string;
};

const popoverVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -6, scale: 0.98 },
};

export default function PostMorePopover({
    open,
    onClose,
    anchorRef,
    postedAt,
}: PostMorePopoverProps) {
    const popoverRef = useRef<HTMLDivElement | null>(null);

    // Focus management
    useEffect(() => {
        if (!open) return;

        const t = setTimeout(() => {
            popoverRef.current?.focus();
        }, 50);

        return () => {
            clearTimeout(t);
            // when popover unmounts, return focus to the trigger
            anchorRef.current?.focus();
        };
    }, [open, anchorRef]);

    // Outside click + Escape handling
    useEffect(() => {
        if (!open) return;

        const onDocumentPointer = (e: Event) => {
            const target = (e.target as Node) || null;
            if (!target) return;

            if (popoverRef.current && popoverRef.current.contains(target)) return;
            if (anchorRef.current && anchorRef.current.contains(target)) return;

            onClose();
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
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
    }, [open, onClose, anchorRef]);

    return (
        <AnimatePresence>
            {open && (
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
                            onClose();
                        }
                    }}
                >
                    <div className={styles.morePopoverInner} role="menu" aria-label="Post options">
                        <div className={styles.sharedRow}>
                            <div className={styles.sharedLabel}>Shared</div>
                            <div className={styles.sharedDate} data-testid="shared-date">
                                {postedAt}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
