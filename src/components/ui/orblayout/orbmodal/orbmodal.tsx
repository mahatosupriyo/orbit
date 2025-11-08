'use client';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './orbmodal.module.scss';
import { ReactNode, useEffect, useRef } from 'react';

interface OrbModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function OrbModal({ isOpen, onClose, children }: OrbModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 🧠 Close when pressing the ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // 🧠 Handle clicks outside the modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the clicked target is NOT inside the modal content
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [1, 0, 0, 1] }}
          onClick={handleOverlayClick}
        >
          <motion.div
            ref={modalRef}
            className={styles.modal}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [1, 0, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.content}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
