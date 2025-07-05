"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ImageItem } from "@/types/garageimagesuploader"

const MAX_IMAGES = 5

export const useImageManager = () => {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const nextIdRef = useRef(0)

  const generateId = useCallback(() => {
    return `image-${Date.now()}-${++nextIdRef.current}`
  }, [])

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const availableSlots = MAX_IMAGES - images.length
      const filesToAdd = fileArray.slice(0, availableSlots)

      const newImages: ImageItem[] = filesToAdd.map((file) => ({
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
      }))

      setImages((prev) => [...prev, ...newImages])
    },
    [images.length, generateId],
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const reorderImages = useCallback((oldIndex: number, newIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [movedImage] = newImages.splice(oldIndex, 1)
      newImages.splice(newIndex, 0, movedImage)
      return newImages
    })
  }, [])

  const clearImages = useCallback(() => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setImages([])
  }, [images])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [])

  return {
    images,
    isUploading,
    setIsUploading,
    addImages,
    removeImage,
    reorderImages,
    clearImages,
    canAddMore: images.length < MAX_IMAGES,
    getFiles: () => images.map((img) => img.file),
  }
}
