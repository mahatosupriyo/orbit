"use client"

import styles from "./usercapsule.module.scss"
import { motion } from "framer-motion"
import Icon from "@/components/atoms/icons"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import { Keyboard, Scrollbar } from "swiper/modules"
import "swiper/css/scrollbar"
import { Drawer } from "vaul"
import Video from "next-video"
import type { GaragePost } from "@/types/userposts"

interface GaragePostCardProps {
  post: GaragePost
}

export default function GaragePostCard({ post }: GaragePostCardProps) {
  const firstImage = post.images[0]
  const hasMultipleImages = post.images.length > 1

  return (
    <div className={styles.capsulewraper}>
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <motion.button
            className={styles.capsulebtn}
            type="button"
            aria-label={`Open ${post.title}`}
            whileTap={{ scale: 0.98 }}
          >
            <motion.img
              src={firstImage.url}
              alt={post.title}
              className={styles.capsulebanner}
              whileHover={{ scale: 1.02 }}
              draggable={false}
              onError={(e) => {
                console.error("Failed to load image:", firstImage.url)
                e.currentTarget.style.display = "none"
              }}
            />

            {post.makingOf && (
              <div className={styles.makingIcon}>
                <Icon name="breakdown" fill="#fff" size={30} />
              </div>
            )}

            {hasMultipleImages && (
              <div className={styles.imageCount}>
                <Icon name="multiplepost" fill="#fff" size={20} />
                <span className={styles.imageCountText}>{post.images.length}</span>
              </div>
            )}
          </motion.button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className={styles.drawerOverlay} />
          <Drawer.Content className={styles.drawerContent}>
            <div className={styles.drawerInner}>
              <Drawer.Title className={styles.drawerTitle}>{post.title}</Drawer.Title>
              <div aria-hidden className={styles.drawerHandle} />

              {post.images.length > 0 && (
                <Swiper
                  scrollbar={{ hide: false }}
                  spaceBetween={10}
                  modules={[Scrollbar, Keyboard]}
                  loop={hasMultipleImages}
                  className={styles.swiper}
                >
                  {post.images.map((img) => (
                    <SwiperSlide key={img.id}>
                      <img
                        src={img.url || "/placeholder.svg"}
                        alt={`${post.title} image`}
                        draggable={false}
                        className={styles.capsulebanner}
                        onError={(e) => {
                          console.error("Failed to load image in swiper:", img.url)
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              <div className={styles.postDetails}>
                <div className={styles.postdetailsinner}>
                  {/* <h1 className={styles.postTitle}>{post.title}</h1> */}
                  {/* {post.caption && <p className={styles.postCaption}>{post.caption}</p>} */}
                </div>

                {post.externalUrl && (
                  <a
                    href={post.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.postLink}
                    aria-label="Open external link"
                  >
                    <Icon name="external" fill="#fff" />
                  </a>
                )}

                {post.makingOf && (
                  <Drawer.NestedRoot>
                    <Drawer.Trigger asChild>
                      <button className={styles.makingvideobtn} aria-label="Play making-of video">
                        <Icon name="play" fill="#fff" />
                      </button>
                    </Drawer.Trigger>
                    <Drawer.Portal>
                      <Drawer.Overlay className={styles.overlaynested} />
                      <Drawer.Content className={styles.overlaycontentnested}>
                        <div className={styles.nestedDrawerInner}>
                          <div className={styles.drawerHandle} />
                          <Drawer.Title className={styles.nestedDrawerTitle}>Breakdown</Drawer.Title>
                          <div className={styles.videoWrapper}>
                            <Video autoPlay playbackId={post.makingOf.playbackID} />
                          </div>
                        </div>
                      </Drawer.Content>
                    </Drawer.Portal>
                  </Drawer.NestedRoot>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
