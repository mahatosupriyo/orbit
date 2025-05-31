"use client";
import React, { useEffect } from 'react';
import { motion, AnimatePresence, easeInOut, easeIn } from 'framer-motion';
import styles from './successpop.module.scss';

interface SuccessPopupProps {
  message: string | null; 
  isVisible: boolean;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 1600);
      return () => clearTimeout(timer); 
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && message && ( // Only render if message is not null
        <motion.div
          className={styles.popup}
          initial={{ y: '100%', opacity: 0 }} // Start from below
          animate={{ y: -20, opacity: 1 }} // Animate to normal position
          exit={{ y: '100%', opacity: 0 }} // Exit animation
          style={{position: 'fixed', bottom: 0, marginBottom: '12rem'}}
          transition={{ 
            duration: 0.4, // Duration of the transition
            ease: [0.785, 0.135, 0.15, 0.86], // Using the specified cubic-bezier
          }}
        >
          <p style={{fontWeight: 500}}>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessPopup;
