"use client"

import type React from "react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import styles from "./overlay.module.scss"

interface OverlayProps {
  children: ReactNode
  fullScreenOnDesktop?: boolean
  buttonText?: string
  buttonClassName?: string
  buttonIcon?: ReactNode
  isControlled?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Overlay component
 * - Renders a modal overlay with animation and accessibility features.
 * - Can be controlled externally or manage its own open state.
 * - Closes on ESC key or clicking outside the content.
 * - Optionally renders a trigger button if not controlled.
 */
export default function Overlay({
  children,
  fullScreenOnDesktop = false,
  buttonText = "Open",
  buttonClassName = "",
  buttonIcon,
  isControlled = false,
  isOpen: controlledIsOpen,
  onOpenChange,
}: OverlayProps) {
  // Use internal state if not controlled externally
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Determine if the overlay is open based on whether it's controlled or not
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  // Ref for the overlay content to detect outside clicks
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle opening the overlay
  const handleOpen = () => {
    if (isControlled) {
      onOpenChange?.(true)
    } else {
      setInternalIsOpen(true)
    }
  }

  // Handle closing the overlay
  const handleClose = () => {
    if (isControlled) {
      onOpenChange?.(false)
    } else {
      setInternalIsOpen(false)
    }
  }

  // Handle ESC key press to close overlay
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen])

  // Handle click outside the overlay content to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose()
    }
  }

  return (
    <>
      {/* Trigger Button (only show if not controlled externally) */}
      {!isControlled && (
        <motion.button
          whileTap={{ opacity: 0.6 }}
          onClick={handleOpen}
          className={`${styles.triggerButton} ${buttonClassName}`}
        >
          {buttonIcon && <span className={styles.buttonIcon}>{buttonIcon}</span>}
          {buttonText}
        </motion.button>
      )}

      {/* Overlay modal with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlayBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          >
            <motion.div
              ref={contentRef}
              className={`${styles.overlayContent} ${fullScreenOnDesktop ? styles.fullScreenDesktop : ""}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close button in the top-right corner */}
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close overlay"
              >
                <X size={24} />
              </button>

              {/* Overlay content body */}
              <div className={styles.overlayBody}>{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}