"use client"

import type React from "react"
import { useRef } from "react"
import styles from "../create.module.scss"
import Icon from "@/components/atoms/icons"

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
        <span className={styles.addIcon}>

          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.1842 0H13.1579V25H11.1842V0Z" fill="#D9D9D9" />
            <path d="M0 13.5478V11.5741H25V13.5478H0Z" fill="#D9D9D9" />
          </svg>

        </span>
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
