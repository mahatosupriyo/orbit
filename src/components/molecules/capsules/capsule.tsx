"use client";

import styles from "./capsule.module.scss";
import { motion } from "framer-motion";
import Icon from "@/components/atoms/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Scrollbar } from "swiper/modules";
import "swiper/css/scrollbar";
import { Drawer } from "vaul";
import Video from "next-video";

interface GaragePost {
    id: number;
    title: string;
    caption: string | null;
    externalUrl: string | null;
    createdAt: string;
    images: Array<{ id: number; url: string; order: number | null }>;
    makingOf: { id: number; playbackID: string } | null;
}

interface GaragePostCardProps {
    post: GaragePost;
}

export default function GaragePostCard({ post }: GaragePostCardProps) {
    const firstImage = post.images[0];
    const hasMultipleImages = post.images.length > 1;

    const dateObj = new Date(post.createdAt);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear().toString().slice(-2);

    return (
        <div className={styles.capsulewraper}>
            <Drawer.Root>
                <Drawer.Trigger asChild>
                    <motion.button
                        className={styles.capsulebtn}
                        type="button"
                        aria-label="Open Post"
                        whileTap={{ scale: 0.98 }}
                    >
                        {firstImage ? (
                            <motion.img
                                src={firstImage.url}
                                alt={post.title}
                                className={styles.capsulebanner}
                                whileHover={{ scale: 1.02 }}
                                draggable={false}
                            />
                        ) : (
                            <div className={styles.placeholder}>
                                <Icon name="save" size={48} />
                            </div>
                        )}

                        {hasMultipleImages && (
                            <div className={styles.imageCount}>+{post.images.length - 1}</div>
                        )}
                    </motion.button>
                </Drawer.Trigger>

                <Drawer.Portal>
                    <Drawer.Overlay className={styles.drawerOverlay} />
                    <Drawer.Content className={styles.drawerContent}>
                        <div className={styles.drawerInner}>
                            <Drawer.Title className={styles.drawerTitle}>{post.title}</Drawer.Title>
                            <div aria-hidden className={styles.drawerHandle} />

                            <Swiper
                                scrollbar={{ hide: false }}
                                spaceBetween={10}
                                modules={[Scrollbar]}
                                loop={hasMultipleImages}
                                className={styles.swiper}
                            >
                                {post.images.map((img) => (
                                    <SwiperSlide key={img.id}>
                                        <img
                                            src={img.url}
                                            alt={`${post.title} image`}
                                            draggable={false}
                                            className={styles.capsulebanner}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            <div className={styles.postDetails}>
                                <div className={styles.postdetailsinner}>
                                    {post.title && <h1 className={styles.postTitle}>{post.title}</h1>}
                                    {post.caption && <p className={styles.postCaption}>{post.caption}</p>}

                                    <div>
                                        <div className={styles.dateBadge}>
                                            <span className={styles.monthYear}>
                                                {month} <sup className={styles.year}>{year}</sup>
                                            </span>
                                            <span className={styles.day}>{day}</span>
                                        </div>
                                    </div>
                                </div>

                                {post.externalUrl && (
                                    <a
                                        href={post.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.postLink}
                                    >
                                        <Icon name="external" />
                                    </a>
                                )}

                                {/* Nested Drawer */}
                                {post.makingOf && (
                                    <Drawer.NestedRoot>
                                        <Drawer.Trigger asChild>
                                            <button className={styles.makingvideobtn}>
                                                <Icon name="play" />

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
                                                            autoPlay
                                                            poster={`https://image.mux.com/${post.makingOf.playbackID}/thumbnail.webp`}
                                                            playbackId={post.makingOf.playbackID}
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
