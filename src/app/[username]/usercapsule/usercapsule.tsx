"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { deleteGaragePost } from "@/app/(main)/garage/deleteGaragePost";
import { useTransition } from "react";
import styles from "./usercapsule.module.scss";
import { motion } from "framer-motion";
import Icon from "@/components/atoms/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css/navigation';
import "swiper/css";
import { Keyboard, Scrollbar, Navigation } from "swiper/modules";
import "swiper/css/scrollbar";
import { Drawer } from "vaul";
import Video from "next-video";
import type { GaragePost } from "@/types/userposts";
import ConfirmDialog from "@/components/atoms/confirmation/confirmationbox";

interface GaragePostCardProps {
  post: GaragePost & {
    signedMux?: {
      signedVideoUrl: string
      signedPosterUrl: string
    } | null
  }
  canDelete: boolean
}


export default function GaragePostCard({ post, canDelete }: GaragePostCardProps) {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const { data: session } = useSession();
  const firstImage = post.images[0];
  const hasMultipleImages = post.images.length > 1;

  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Delete handler with async wrapped for startTransition
  const handleDelete = () => {
    startTransition(() => {
      (async () => {
        const formData = new FormData();
        formData.append("postId", post.id.toString());
        await deleteGaragePost(formData);
      })();
    });
  };

  return (
    <div className={styles.capsulewraper}>
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
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
                console.error("Failed to load image:", firstImage.url);
                e.currentTarget.style.display = "none";
              }}
            />

            {post.makingOf && (
              <div className={styles.makingIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.orbitoriginal} viewBox="0 0 138 231" fill="none">
                  <path d="M0 0H138V231L69 208.5L0 231V0Z" fill="#1414FF" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M69.1426 135.861C73.1293 135.861 76.3611 132.629 76.3611 128.643C76.3611 124.656 73.1293 121.424 69.1426 121.424C65.1559 121.424 61.924 124.656 61.924 128.643C61.924 132.629 65.1559 135.861 69.1426 135.861ZM69.1426 176.285C95.4548 176.285 116.785 154.955 116.785 128.643C116.785 102.33 95.4548 81 69.1426 81C42.8303 81 21.5 102.33 21.5 128.643C21.5 154.955 42.8303 176.285 69.1426 176.285Z" fill="white" />
                </svg>
              </div>
            )}

            {hasMultipleImages && (
              <div className={styles.imageCount}>
                {/* Optional: Image count or multi-post icon */}
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

              <div className={styles.swiperwraper}>
                {post.images.length > 0 && (
                  <Swiper
                    navigation={{
                      nextEl: ".custom-next",
                      prevEl: ".custom-prev",
                    }}
                    keyboard={{ enabled: true }}
                    scrollbar={{ hide: false }}
                    spaceBetween={10}
                    modules={[Scrollbar, Keyboard, Navigation]}
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
                            console.error("Failed to load image in swiper:", img.url);
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}

                {/* Custom Navigation Buttons */}
                {hasMultipleImages && (
                  <div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={`custom-prev ${styles.customNavBtn} ${styles.customPrevBtn}`} aria-label="Previous image">
                      <Icon name="leftarrow" size={24} fill="#fff" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={`custom-next ${styles.customNavBtn} ${styles.customNextBtn}`} aria-label="Next image">
                      <Icon name="rightarrow" size={24} fill="#fff" />
                    </motion.button>
                  </div>
                )}
              </div>


              <div className={styles.postDetails}>
                <div className={styles.postdetailsinner} />

                <Drawer.Close asChild>
                  <button className={styles.closebtn} aria-label="Close">
                    Close
                    <span className={styles.key}>Esc</span>
                  </button>
                </Drawer.Close>

                {/* Delete Button with Confirmation Dialog */}
                {canDelete && (
                  <ConfirmDialog
                    trigger={
                      <button className={styles.deleteButton} disabled={isPending}>
                        {isPending ? "Deleting" : "Delete"}
                        <span className={styles.key}>Del</span>
                      </button>
                    }
                    title="Confirm Delete"
                    description="you can’t undo this."
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={handleDelete}
                    openOnDeleteKey={true}
                  />
                )}

                {/* External URL */}
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

                {post.makingOf && post.signedMux && (
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
                            <Video
                              src={post.signedMux.signedVideoUrl}
                              poster={post.signedMux.signedPosterUrl}
                              controls
                              autoPlay
                              style={{ borderRadius: "12px" }}
                            />
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
  );
}
