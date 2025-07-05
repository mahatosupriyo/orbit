"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, Play } from "lucide-react"


interface GaragePost {
  id: number
  title: string
  caption: string | null
  externalUrl: string | null
  createdAt: Date
  images: Array<{ id: number; url: string; order: number | null }>
  makingOf: { id: number; playbackID: string } | null
}

interface GaragePostGalleryProps {
  post: GaragePost
}

export default function GaragePostGallery({ post }: GaragePostGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            {post.caption && <p className="text-muted-foreground mb-3">{post.caption}</p>}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </div>
              {post.externalUrl && (
                <a
                  href={post.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View External Link
                </a>
              )}
            </div>
          </div>

          {post.makingOf && (
            <div className="ml-4">
              <Play className="w-3 h-3 mr-1" />
              Making-of Available
            </div>
          )}
        </div>
      </div>

      {/* Main Gallery */}
      <div className="flex-1 flex items-center justify-center relative bg-black/5">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={post.images[currentImageIndex]?.url}
            alt={`${post.title} - Image ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {post.images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-0"
              onClick={prevImage}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-0"
              onClick={nextImage}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {post.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {post.images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {post.images.length > 1 && (
        <div className="p-4 border-t">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {post.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
