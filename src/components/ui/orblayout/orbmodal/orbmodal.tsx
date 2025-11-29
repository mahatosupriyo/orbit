'use client';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './orbmodal.module.scss';
import { ReactNode, useEffect, useRef } from 'react';

/**
 * Props for the OrbModal component
 */
interface OrbModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** Callback function triggered when the modal should close */
  onClose: () => void;
  /** Content to be rendered inside the modal */
  children: ReactNode;
}

/**
 * OrbModal - A reusable modal component with smooth animations
 *
 * Features:
 * - Close on ESC key press
 * - Close on overlay click
 * - Smooth fade and slide animations
 * - Prevents event propagation for internal clicks
 *
 * @component
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * return (
 *   <>
 *     <button onClick={() => setIsOpen(true)}>Open Modal</button>
 *     <OrbModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *       <h2>Modal Content</h2>
 *     </OrbModal>
 *   </>
 * );
 */
export default function OrbModal({ isOpen, onClose, children }: OrbModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Handle ESC key press to close modal
   * Adds/removes event listener based on isOpen state
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  /**
   * Handle overlay click to close modal
   * Only closes if the click target is outside the modal content
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [1, 0, 0, 1] }}
          onClick={handleOverlayClick}
          role="presentation"
          aria-hidden="true"
        >
          <motion.div
            ref={modalRef}
            className={styles.modal}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [1, 0, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.content}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
