"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { ImageItem } from "@/types/garageimagesuploader"
import styles from "../garage-uploader.module.scss"

interface SortableImageItemProps {
  image: ImageItem
  onRemove: (id: string) => void
}

export const SortableImageItem: React.FC<SortableImageItemProps> = ({ image, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(image.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.preview} ${isDragging ? styles.dragging : ""}`}
      {...attributes}
      {...listeners}
    >
      <img
        src={image.previewUrl || "/placeholder.svg"}
        alt={`Preview of ${image.file.name}`}
        className={styles.previewImage}
        loading="lazy"
      />
      <button
        type="button"
        className={styles.removeButton}
        onClick={handleRemove}
        aria-label={`Remove ${image.file.name}`}
        tabIndex={0}
      >
        <span aria-hidden="true">✕</span>
      </button>
      {image.isUploading && (
        <div className={styles.uploadingOverlay}>
          <div className={styles.spinner} />
        </div>
      )}
    </div>
  )
}
