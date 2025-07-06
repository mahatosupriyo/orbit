
"use client"
import type React from "react"
import { useState, type FormEvent, useCallback, useEffect } from "react"
import { uploadGaragePost } from "./create"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useImageManager } from "@/hooks/garageimagemanager"
import { SortableImageItem } from "./components/sortableimageitem"
import { ImageUploadZone } from "./components/imageuploaderzone"
import type { GaragePostFormData, UploadResult } from "@/types/garageimagesuploader"
import styles from "./create.module.scss"
import NavBar from "@/components/molecules/navbar/navbar"
import BackBtn from "@/components/atoms/(buttons)/backbtn/backbtn"
import { toast } from "react-hot-toast"

const INITIAL_FORM_DATA: GaragePostFormData = {
    title: "",
    caption: "",
    externalUrl: "",
    makingOf: "",
}

export default function GaragePostUploader() {
    const [formData, setFormData] = useState<GaragePostFormData>(INITIAL_FORM_DATA)
    const [submitError, setSubmitError] = useState<string | null>(null)


    const {
        images,
        isUploading,
        setIsUploading,
        addImages,
        removeImage,
        reorderImages,
        clearImages,
        canAddMore,
        getFiles,
    } = useImageManager()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    )

    const handleInputChange = useCallback(
        (field: keyof GaragePostFormData) => {
            return (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                }))
                // Clear error when user starts typing
                if (submitError) setSubmitError(null)
            }
        },
        [submitError],
    )

    const handleFilesSelected = useCallback(
        (files: FileList) => {
            try {
                addImages(files)
            } catch (error) {
                console.error("Error adding images:", error)
                setSubmitError("Failed to add images. Please try again.")
            }
        },
        [addImages],
    )

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event

            if (!over || active.id === over.id) return

            const oldIndex = images.findIndex((img) => img.id === active.id)
            const newIndex = images.findIndex((img) => img.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderImages(oldIndex, newIndex)
            }
        },
        [images, reorderImages],
    )

    const validateForm = (): string | null => {
        if (!formData.title.trim()) {
            return "Title is required"
        }
        if (images.length === 0) {
            return "At least one image is required"
        }
        if (formData.externalUrl && !isValidUrl(formData.externalUrl)) {
            return "Please enter a valid URL"
        }
        return null
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError); // ✅ show toast error
            return;
        }

        setIsUploading(true);

        try {
            const formDataToSubmit = new FormData();

            // Add form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value.trim()) {
                    formDataToSubmit.append(key, value.trim());
                }
            });

            // Add images
            getFiles().forEach((file) => {
                formDataToSubmit.append("images", file);
            });

            const result: UploadResult = await uploadGaragePost(formDataToSubmit);

            if (result.success) {
                setFormData(INITIAL_FORM_DATA);
                clearImages();
                toast.success("Post uploaded successfully!"); // ✅ success toast
            } else {
                toast.error(result.message || "Upload failed. Please try again."); // ✅ toast error
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An unexpected error occurred. Please try again."); // ✅ fallback toast
        } finally {
            setIsUploading(false);
        }
    };


    const imageIds = images.map((img) => img.id)

    return (
        <div className={styles.wraper}>
            <NavBar />
            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.uploader} noValidate>
                    <div className={styles.toplayer}>
                        <BackBtn />

                        <button type="submit" className={styles.submitbtn} disabled={isUploading || images.length === 0}>
                            {isUploading ? "Uploading" : "Upload"}
                        </button>
                    </div>

                    <div className={styles.layoutgrid}>
                        <div className={styles.garagepost}>
                            <label className={styles.imagelabel}>({images.length}/5)</label>

                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={imageIds} strategy={verticalListSortingStrategy}>
                                    <div className={styles.previewGrid}>
                                        {images.map((image) => (
                                            <SortableImageItem key={image.id} image={image} onRemove={removeImage} />
                                        ))}

                                        {canAddMore && (
                                            <ImageUploadZone
                                                onFilesSelected={handleFilesSelected}
                                                canAddMore={canAddMore}
                                                disabled={isUploading}
                                            />
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>

                        </div>
                        <div className={styles.garagepostform}>

                            <label htmlFor="title" className={styles.label}>
                                title*
                                <input
                                    id="title"
                                    type="text"
                                    autoComplete="off"
                                    value={formData.title}
                                    onChange={handleInputChange("title")}
                                    className={styles.input}
                                    placeholder="Catchy, short, and clear"
                                    required
                                    disabled={isUploading}
                                />
                            </label>

                            <label htmlFor="caption" className={styles.label}>
                                caption
                                <input
                                    id="caption"
                                    type="text"
                                    autoComplete="off"

                                    value={formData.caption}
                                    onChange={handleInputChange("caption")}
                                    className={styles.input}
                                    placeholder="What’s the story here"
                                    disabled={isUploading}
                                />
                            </label>

                            <label htmlFor="externalUrl" className={styles.label}>
                                source
                                <input
                                    id="externalUrl"
                                    type="url"
                                    autoComplete="off"

                                    value={formData.externalUrl}
                                    onChange={handleInputChange("externalUrl")}
                                    className={styles.input}
                                    placeholder="YouTube, Loom, or anything else works"
                                    disabled={isUploading}
                                />
                            </label>

                            <label htmlFor="makingOf" className={styles.label}>
                                breakdown
                                <input
                                    id="makingOf"
                                    type="text"
                                    autoComplete="off"

                                    value={formData.makingOf}
                                    onChange={handleInputChange("makingOf")}
                                    className={styles.input}
                                    placeholder="Behind the Scenes"
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    </div>



                    {submitError && (
                        <div className={styles.errorMessage} role="alert">
                            {submitError}
                        </div>
                    )}

                </form>
            </div>
        </div>
    )
}

// Utility function
function isValidUrl(string: string): boolean {
    try {
        new URL(string)
        return true
    } catch {
        return false
    }
}
