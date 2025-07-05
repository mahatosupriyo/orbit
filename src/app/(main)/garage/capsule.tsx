'use client'

import styles from "./capsule.module.scss"
import { motion } from "framer-motion"
import Icon from "@/components/atoms/icons"
import { Swiper, SwiperSlide } from "swiper/react"
import { Scrollbar } from "swiper/modules"
import 'swiper/css'
import 'swiper/css/scrollbar'

import { useState } from "react"
import Overlay from "@/components/overlay/overlay"
import { ExternalLink, Calendar, Trash2 } from "lucide-react"
import { deleteGaragePost } from "./deleteGaragePost"

interface CapsuleProps {
  imgSrcs: string[]
  alt?: string
  title?: string
  caption?: string
  date?: Date
  externalUrl?: string | null
  makingOf?: boolean
  isOwner?: boolean
  postId?: number
  userId?: string
}

export default function CapsuleCard({
  imgSrcs,
  alt = "Capsule Image",
  title,
  caption,
  date,
  externalUrl,
  makingOf,
  isOwner = false,
  postId,
  userId,
}: CapsuleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))

  async function handleDelete() {
    const confirmed = confirm("Delete this post?")
    if (!confirmed) return
    if (!postId || !userId) return
    setDeleting(true)
    await deleteGaragePost(postId, userId)
    setDeleting(false)
    setIsOpen(false)
  }

  return (
    <>
      <motion.div
        className={styles.capsulewraper}
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div className={styles.capsulebtn} draggable="false">
          <img
            src={imgSrcs[0]}
            alt={alt}
            draggable="false"
            className={styles.capsulebanner}
          />
        </motion.div>

        <motion.button whileTap={{ scale: 0.9 }} className={styles.save}>
          <Icon name="save" size={28} />
        </motion.button>
      </motion.div>

      <Overlay isControlled isOpen={isOpen} onOpenChange={setIsOpen} fullScreenOnDesktop>
        <div className={styles.overlayContainer}>
          <Swiper
            scrollbar={{ hide: false }}
            spaceBetween={10}
            modules={[Scrollbar]}
            loop={imgSrcs.length > 1}
            className={styles.swiper}
          >
            {imgSrcs.map((src, i) => (
              <SwiperSlide key={i}>
                <img
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  className={styles.capsulebanner}
                  draggable="false"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className={styles.details}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {caption && <p className={styles.caption}>{caption}</p>}

            <div className={styles.meta}>
              {date && (
                <span className={styles.date}>
                  <Calendar size={14} />
                  {formatDate(date)}
                </span>
              )}
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <ExternalLink size={14} />
                  Link
                </a>
              )}
              {makingOf && <div className={styles.makingOf}>🎬 Making-of Available</div>}
            </div>

            {isOwner && postId && userId && (
              <form action={handleDelete}>
                <button className={styles.deleteBtn} type="submit" disabled={deleting}>
                  <Trash2 size={16} />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Overlay>
    </>
  )
}
