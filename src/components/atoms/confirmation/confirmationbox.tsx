'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './confirmationbox.module.scss'

interface ConfirmDialogProps {
  trigger: React.ReactNode
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  openOnDeleteKey?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function ConfirmDialog({
  trigger,
  title,
  description = 'You can’t undo this.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  openOnDeleteKey = false,
  onOpenChange,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!openOnDeleteKey) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [openOnDeleteKey])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    onOpenChange?.(open)
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>

      <AnimatePresence>
        {open && (
          <AlertDialog.Portal forceMount>
            <AlertDialog.Overlay asChild>
              <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AlertDialog.Overlay>

            <AlertDialog.Content asChild>
              <motion.div
                className={styles.content}
                initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <div className={styles.alertlogowraper}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 95 84" fill="none">
                    <path d="M93.5805 67.4915L56.525 5.18383C54.6179 1.96984 51.157 0 47.4194 0C43.6818 0 40.2209 1.96975 38.3137 5.18383L1.41856 67.4915C-0.464948 70.7527 -0.47321 74.7701 1.39611 78.0397C3.26543 81.3094 6.73119 83.3403 10.4969 83.3724H84.6079C88.3549 83.3039 91.7873 81.2585 93.6307 77.995C95.474 74.7314 95.4546 70.7375 93.5805 67.4915ZM47.5531 72.7851C46.1493 72.7851 44.8023 72.2274 43.8097 71.2348C42.8172 70.2423 42.2594 68.8952 42.2594 67.4915C42.2594 66.0877 42.8172 64.7407 43.8097 63.7481C44.8023 62.7556 46.1493 62.1978 47.5531 62.1978C48.9568 62.1978 50.3039 62.7556 51.2964 63.7481C52.289 64.7407 52.8467 66.0877 52.8467 67.4915C52.8467 68.8952 52.289 70.2423 51.2964 71.2348C50.3039 72.2274 48.9568 72.7851 47.5531 72.7851ZM52.8467 48.9637C52.8467 50.8555 51.8376 52.603 50.1999 53.5483C48.5622 54.4936 46.544 54.4936 44.9063 53.5483C43.2686 52.603 42.2594 50.8554 42.2594 48.9637V27.7892C42.2594 25.8974 43.2685 24.1499 44.9063 23.2046C46.544 22.2593 48.5622 22.2593 50.1999 23.2046C51.8376 24.1499 52.8467 25.8975 52.8467 27.7892V48.9637Z" fill="#ac1916" />
                  </svg>
                </div>

                <div>
                  <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
                  <AlertDialog.Description className={styles.description}>
                    {description}
                  </AlertDialog.Description>
                </div>

                <div className={styles.actions}>
                  <AlertDialog.Cancel className={styles.cancelBtn}>
                    {cancelText}
                    <span className={styles.key}>Esc</span>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action
                    className={styles.confirmBtn}
                    onClick={() => {
                      onConfirm()
                      setOpen(false)
                    }}
                  >
                    {confirmText}
                  </AlertDialog.Action>
                </div>
              </motion.div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  )
}
