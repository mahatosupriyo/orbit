"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Calendar, ImageIcon, Trash2 } from "lucide-react"

import Overlay from "@/components/overlay/overlay"
import GaragePostGallery from "./garage-capsule"
import { deleteGaragePost } from "../deleteGaragePost" // make sure this is exported
import styles from "./garage.module.scss"

interface GaragePost {
  id: number
  title: string
  caption: string | null
  externalUrl: string | null
  createdAt: Date
  images: Array<{ id: number; url: string; order: number | null }>
  makingOf: { id: number; playbackID: string } | null
}

interface GaragePostCardProps {
  post: GaragePost
  userId: string
}

export default function GaragePostCard({ post, userId }: GaragePostCardProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const firstImage = post.images[0]
  const hasMultipleImages = post.images.length > 1

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))

  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this post?")
    if (!confirmed) return
    setDeleting(true)
    await deleteGaragePost(post.id, userId)
  }

  return (
    <>
      <div className={styles.card}>
        <button className={styles.thumbnail} onClick={() => setIsOverlayOpen(true)} aria-label="Open Gallery">
          {firstImage ? (
            <motion.img
              src={firstImage.url}
              alt={post.title}
              className={styles.image}
              whileHover={{ scale: 1.02 }}
            />
          ) : (
            <div className={styles.placeholder}>
              <ImageIcon className={styles.icon} />
            </div>
          )}

          {hasMultipleImages && (
            <div className={styles.imageCount}>+{post.images.length - 1}</div>
          )}

          <div className={styles.overlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className={styles.overlayText}
            >
              View Gallery
            </motion.div>
          </div>
        </button>

        <div className={styles.info}>
          <div>
            <h3 className={styles.title}>{post.title}</h3>
            {post.caption && <p className={styles.caption}>{post.caption}</p>}
          </div>

          <div className={styles.meta}>
            <div className={styles.date}>
              <Calendar className={styles.metaIcon} />
              {formatDate(post.createdAt)}
            </div>

            {post.externalUrl && (
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className={styles.metaIcon} />
                Link
              </a>
            )}
          </div>

          {post.makingOf && (
            <div className={styles.makingOf}>
              🎬 Making-of Available
            </div>
          )}

          {/* Delete Button */}
          <form action={handleDelete}>
            <button
              type="submit"
              className={styles.deleteBtn}
              disabled={deleting}
              aria-label="Delete Post"
            >
              <Trash2 size={16} className={styles.deleteIcon} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </form>
        </div>
      </div>

      <Overlay
        isControlled
        isOpen={isOverlayOpen}
        onOpenChange={setIsOverlayOpen}
        fullScreenOnDesktop
      >
        <GaragePostGallery post={post} />
      </Overlay>
    </>
  )
}
