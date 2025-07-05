"use client"

import type React from "react"
import { useRef } from "react"
import styles from "../garage-uploader.module.scss"

interface ImageUploadZoneProps {
  onFilesSelected: (files: FileList) => void
  canAddMore: boolean
  disabled?: boolean
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onFilesSelected, canAddMore, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!disabled && canAddMore) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
      // Reset input to allow selecting the same files again
      e.target.value = ""
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`${styles.addButton} ${!canAddMore || disabled ? styles.disabled : ""}`}
        disabled={!canAddMore || disabled}
        aria-label="Add images"
      >
        <span className={styles.addIcon}>+</span>
        <span>Add Image</span>
        <span className={styles.addHint}>{canAddMore ? "Click to browse" : "Maximum reached"}</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  )
}
