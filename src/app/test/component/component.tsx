'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './component.module.scss';

/* ============================================================================
   OrbButton — Reusable Button Component
   ============================================================================ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'disabled' | 'iconic' | 'fullwidth';
  fullWidth?: boolean;
}

const OrbButton: React.FC<ButtonProps> = ({
  variant = 'default',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const buttonClass = `
    ${styles.orbbutton}
    ${styles[variant] || ''}
    ${fullWidth ? styles.fullWidth : ''}
    ${className}
  `;

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

/* ============================================================================
   SearchModalExample — Modal + Button Integrated
   ============================================================================ */
export default function SearchModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Open Modal Button */}
      <OrbButton onClick={() => setIsOpen(true)}>Open Search Modal</OrbButton>

      {/* AnimatePresence enables smooth entry/exit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [1, 0, 0, 1] }}
          >
            <motion.div
              className={styles.modal}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3, ease: [1, 0, 0, 1] }}
            >
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                ✕
              </button>

              <h2 className={styles.modalTitle}>Search</h2>
              <input
                type="text"
                placeholder="Type to search..."
                className={styles.input}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
