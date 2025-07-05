
import React from 'react'
// import GarageUploader from './garage-uploader'
import GaragePostView from './garageposts'
import GaragePostUploader from './garagepreview'

function TestPage() {
  return (
    <div>
      <GaragePostView />
      {/* <GaragePostUploader /> */}
    </div>
  )
}

export default TestPage



// "use client"
// import type React from "react"
// import { useState, type FormEvent, useCallback } from "react"
// import { uploadGaragePost } from "./garageaction"
// import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
// import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
// import { useImageManager } from "@/hooks/garageimagemanager"
// import { SortableImageItem } from "./components/sortableimageitem"
// import { ImageUploadZone } from "./components/imageuploaderzone"
// import type { GaragePostFormData, UploadResult } from "@/types/garageimagesuploader"
// import { useSortable } from "@dnd-kit/sortable"
// import styles from "./garage-uploader.module.scss"
// import { CSS } from "@dnd-kit/utilities"

// const INITIAL_FORM_DATA: GaragePostFormData = {
//   title: "",
//   caption: "",
//   externalUrl: "",
//   makingOf: "",
// }

// function SortableImage({
//   id,
//   url,
//   onRemove,
// }: {
//   id: string
//   url: string
//   onRemove: (id: string) => void
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   }

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.preview}>
//       <img src={url || "/placeholder.svg"} alt="Preview" />
//       <button
//         type="button"
//         className={styles.removeButton}
//         onClick={(e) => {
//           e.stopPropagation()
//           onRemove(id)
//         }}
//       >
//         ✕
//       </button>
//     </div>
//   )
// }

// export default function GaragePostUploader() {
//   const [formData, setFormData] = useState<GaragePostFormData>(INITIAL_FORM_DATA)
//   const [submitError, setSubmitError] = useState<string | null>(null)

//   const {
//     images,
//     isUploading,
//     setIsUploading,
//     addImages,
//     removeImage,
//     reorderImages,
//     clearImages,
//     canAddMore,
//     getFiles,
//   } = useImageManager()

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//   )

//   const handleInputChange = useCallback(
//     (field: keyof GaragePostFormData) => {
//       return (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData((prev) => ({
//           ...prev,
//           [field]: e.target.value,
//         }))
//         // Clear error when user starts typing
//         if (submitError) setSubmitError(null)
//       }
//     },
//     [submitError],
//   )

//   const handleFilesSelected = useCallback(
//     (files: FileList) => {
//       try {
//         addImages(files)
//       } catch (error) {
//         console.error("Error adding images:", error)
//         setSubmitError("Failed to add images. Please try again.")
//       }
//     },
//     [addImages],
//   )

//   const handleDragEnd = useCallback(
//     (event: DragEndEvent) => {
//       const { active, over } = event

//       if (!over || active.id === over.id) return

//       const oldIndex = images.findIndex((img) => img.id === active.id)
//       const newIndex = images.findIndex((img) => img.id === over.id)

//       if (oldIndex !== -1 && newIndex !== -1) {
//         reorderImages(oldIndex, newIndex)
//       }
//     },
//     [images, reorderImages],
//   )

//   const validateForm = (): string | null => {
//     if (!formData.title.trim()) {
//       return "Title is required"
//     }
//     if (images.length === 0) {
//       return "At least one image is required"
//     }
//     if (formData.externalUrl && !isValidUrl(formData.externalUrl)) {
//       return "Please enter a valid URL"
//     }
//     return null
//   }

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault()

//     const validationError = validateForm()
//     if (validationError) {
//       setSubmitError(validationError)
//       return
//     }

//     setIsUploading(true)
//     setSubmitError(null)

//     try {
//       const formDataToSubmit = new FormData()

//       // Add form fields
//       Object.entries(formData).forEach(([key, value]) => {
//         if (value.trim()) {
//           formDataToSubmit.append(key, value.trim())
//         }
//       })

//       // Add images
//       getFiles().forEach((file) => {
//         formDataToSubmit.append("images", file)
//       })

//       const result: UploadResult = await uploadGaragePost(formDataToSubmit)

//       if (result.success) {
//         // Reset form on success
//         setFormData(INITIAL_FORM_DATA)
//         clearImages()
//         // You might want to show a success toast here instead of alert
//         console.log("Upload successful:", result.message)
//       } else {
//         setSubmitError(result.message || "Upload failed. Please try again.")
//       }
//     } catch (error) {
//       console.error("Upload error:", error)
//       setSubmitError("An unexpected error occurred. Please try again.")
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   const imageIds = images.map((img) => img.id)

//   return (
//     <div className={styles.container}>
//       {/* <GaragePostView /> */}

//       <form onSubmit={handleSubmit} className={styles.uploader} noValidate>
//         <div className={styles.formGroup}>
//           <label htmlFor="title" className={styles.label}>
//             Title *
//           </label>
//           <input
//             id="title"
//             type="text"
//             value={formData.title}
//             onChange={handleInputChange("title")}
//             className={styles.input}
//             placeholder="Enter post title"
//             required
//             disabled={isUploading}
//           />
//         </div>

//         <div className={styles.formGroup}>
//           <label htmlFor="caption" className={styles.label}>
//             Caption
//           </label>
//           <input
//             id="caption"
//             type="text"
//             value={formData.caption}
//             onChange={handleInputChange("caption")}
//             className={styles.input}
//             placeholder="Enter caption (optional)"
//             disabled={isUploading}
//           />
//         </div>

//         <div className={styles.formGroup}>
//           <label htmlFor="externalUrl" className={styles.label}>
//             External URL
//           </label>
//           <input
//             id="externalUrl"
//             type="url"
//             value={formData.externalUrl}
//             onChange={handleInputChange("externalUrl")}
//             className={styles.input}
//             placeholder="https://example.com"
//             disabled={isUploading}
//           />
//         </div>

//         <div className={styles.formGroup}>
//           <label htmlFor="makingOf" className={styles.label}>
//             Making Of Playbook ID
//           </label>
//           <input
//             id="makingOf"
//             type="text"
//             value={formData.makingOf}
//             onChange={handleInputChange("makingOf")}
//             className={styles.input}
//             placeholder="Enter playbook ID (optional)"
//             disabled={isUploading}
//           />
//         </div>

//         <div className={styles.formGroup}>
//           <label className={styles.label}>Images * ({images.length}/5)</label>

//           <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//             <SortableContext items={imageIds} strategy={verticalListSortingStrategy}>
//               <div className={styles.previewGrid}>
//                 {images.map((image) => (
//                   <SortableImageItem key={image.id} image={image} onRemove={removeImage} />
//                 ))}

//                 {canAddMore && (
//                   <ImageUploadZone
//                     onFilesSelected={handleFilesSelected}
//                     canAddMore={canAddMore}
//                     disabled={isUploading}
//                   />
//                 )}
//               </div>
//             </SortableContext>
//           </DndContext>
//         </div>

//         {submitError && (
//           <div className={styles.errorMessage} role="alert">
//             {submitError}
//           </div>
//         )}

//         <button type="submit" className={styles.submitButton} disabled={isUploading || images.length === 0}>
//           {isUploading ? "Uploading..." : "Upload Post"}
//         </button>
//       </form>
//     </div>
//   )
// }

// // Utility function
// function isValidUrl(string: string): boolean {
//   try {
//     new URL(string)
//     return true
//   } catch {
//     return false
//   }
// }
