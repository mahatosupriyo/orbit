"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { deleteGaragePost } from "@/app/(main)/garage/deleteGaragePost";
import { useTransition } from "react";
import styles from "./usercapsule.module.scss";
import { motion } from "framer-motion";
import Icon from "@/components/atoms/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Keyboard, Scrollbar } from "swiper/modules";
import "swiper/css/scrollbar";
import { Drawer } from "vaul";
import Video from "next-video";
import type { GaragePost } from "@/types/userposts";
import ConfirmDialog from "@/components/atoms/confirmation/confirmationbox";

interface GaragePostCardProps {
  post: GaragePost;
  canDelete: boolean;
}

export default function GaragePostCard({ post, canDelete }: GaragePostCardProps) {
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
                <Icon name="breakdown" fill="#fff" size={30} />
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
                          console.error("Failed to load image in swiper:", img.url);
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

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

                {/* Making Of Video */}
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
  );
}
