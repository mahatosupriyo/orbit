"use client";
import React, { useState, useRef, ChangeEvent, FormEvent, useMemo } from "react";
import { uploadGaragePost } from "./garageaction";
import styles from "./garage-uploader.module.scss";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableImage({
  id,
  url,
  onRemove,
}: {
  id: string;
  url: string;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.preview}
    >
      <img src={url || "/placeholder.svg"} alt="Preview" />
      <button
        type="button"
        className={styles.removeButton}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function GaragePostUploader() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [makingOf, setMakingOf] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewURLs, setPreviewURLs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const items = useMemo(() => previewURLs, [previewURLs]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selected = Array.from(files).slice(0, 5 - images.length);
    const previews = selected.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...selected]);
    setPreviewURLs((prev) => [...prev, ...previews]);
  };

  const handleImageRemove = (urlToRemove: string) => {
    const index = previewURLs.findIndex((url) => url === urlToRemove);
    
    if (index === -1) return;

    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(urlToRemove);

    // Create new arrays without the removed item
    const newImages = images.filter((_, i) => i !== index);
    const newPreviewURLs = previewURLs.filter((_, i) => i !== index);

    setImages(newImages);
    setPreviewURLs(newPreviewURLs);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = previewURLs.findIndex((url) => url === active.id);
    const newIndex = previewURLs.findIndex((url) => url === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Update both arrays in sync
    setPreviewURLs((urls) => arrayMove(urls, oldIndex, newIndex));
    setImages((imgs) => arrayMove(imgs, oldIndex, newIndex));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || images.length === 0) {
      alert("Title and at least one image are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (caption) formData.append("caption", caption);
    if (externalUrl) formData.append("externalUrl", externalUrl);
    if (makingOf) formData.append("makingOf", makingOf);
    
    images.forEach((file) => formData.append("images", file));

    try {
      const result = await uploadGaragePost(formData);
      alert(result.message);
      
      if (result.success) {
        // Clean up object URLs before clearing state
        previewURLs.forEach(url => URL.revokeObjectURL(url));
        
        setTitle("");
        setCaption("");
        setExternalUrl("");
        setMakingOf("");
        setImages([]);
        setPreviewURLs([]);
      }
    } catch (error) {
      alert("An error occurred while uploading the post");
      console.error(error);
    }
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previewURLs.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.uploader}>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      
      <input
        type="text"
        name="caption"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      
      <input
        type="url"
        name="externalUrl"
        placeholder="External URL"
        value={externalUrl}
        onChange={(e) => setExternalUrl(e.target.value)}
      />
      
      <input
        type="text"
        name="makingOf"
        placeholder="Making Of Playbook ID (optional)"
        value={makingOf}
        onChange={(e) => setMakingOf(e.target.value)}
      />

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className={styles.previewGrid}>
            {previewURLs.map((url) => (
              <SortableImage
                key={url}
                id={url}
                url={url}
                onRemove={handleImageRemove}
              />
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.addButton}
              >
                + Add Image
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <input
        type="file"
        name="images"
        multiple
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      
      <button type="submit">Upload Post</button>
    </form>
  );
}
