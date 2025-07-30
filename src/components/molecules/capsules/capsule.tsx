"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./capsule.module.scss";
import { motion } from "framer-motion";
import Icon from "@/components/atoms/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/navigation';
import { Scrollbar, Keyboard, Navigation } from "swiper/modules";
import "swiper/css/scrollbar";
import { Drawer } from "vaul";
import Video from "next-video";
import Link from "next/link";

interface GaragePost {
    id: number;
    title: string;
    caption: string | null;
    externalUrl: string | null;
    createdAt: string;
    images: Array<{ id: number; url: string; order: number | null }>;
    makingOf: { id: number; playbackID: string } | null;
    createdBy: {
        username: string | null;
        image: string | null;
    };
    signedMux?: {
        signedVideoUrl: string;
        signedPosterUrl: string;
    } | null;
}

interface GaragePostCardProps {
    post: GaragePost;
}

export default function GaragePostCard({ post }: GaragePostCardProps) {
    const prevRef = useRef<HTMLButtonElement>(null)
    const nextRef = useRef<HTMLButtonElement>(null)
    const firstImage = post.images[0];
    const hasMultipleImages = post.images.length > 1;

    const dateObj = new Date(post.createdAt);

    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear().toString().slice(-2);

    const signedUrls = post.signedMux ?? null;


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
                                <Swiper
                                    navigation={{
                                        nextEl: ".custom-next",
                                        prevEl: ".custom-prev",
                                    }}
                                    scrollbar={{ hide: false }}
                                    keyboard={{ enabled: true }}
                                    spaceBetween={10}
                                    modules={[Scrollbar, Keyboard, Navigation]}
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
                                <div className={styles.postdetailsinner}>

                                    {post.createdBy.username && (
                                        <Link href={`/${post.createdBy.username}`} className={styles.postAuthor}>
                                            {post.createdBy.image && (
                                                <img
                                                    src={post.createdBy.image}
                                                    className={styles.postAuthorImage}
                                                />
                                            )}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.2rem',
                                                }}
                                            >
                                                <span style={{
                                                    fontSize: '1.26rem',
                                                    fontWeight: 400,
                                                    opacity: 0.6
                                                }}>
                                                </span>
                                                <span className={styles.labelauthor}>
                                                    {post.createdBy.username}
                                                    <Icon name="verified" fill="#00aaff" size={12} />
                                                </span>
                                            </div>
                                        </Link>
                                    )}

                                    {/* Add close functionality */}
                                    <Drawer.Close asChild>
                                        <button
                                            className={styles.closebtn}
                                            aria-label="Close"
                                        >
                                            Close
                                            <span className={styles.key}>
                                                Esc
                                            </span>
                                        </button>
                                    </Drawer.Close>

                                    {/* {post.title && <h1 className={styles.postTitle}>{post.title}</h1>} */}

                                    {/* {post.caption && <p className={styles.postCaption}>{post.caption}</p>} */}
                                </div>

                                {post.externalUrl && (
                                    <a
                                        href={post.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.postLink}
                                    >
                                        <Icon name="external" fill="#fff" />
                                    </a>
                                )}



                                {/* Nested Drawer */}
                                {post.makingOf && (
                                    <Drawer.NestedRoot>
                                        <Drawer.Trigger asChild>
                                            <button className={styles.makingvideobtn}>
                                                <Icon name="play" fill="#fff" />
                                            </button>
                                        </Drawer.Trigger>
                                        <Drawer.Portal>
                                            <Drawer.Overlay className={styles.overlaynested} />
                                            <Drawer.Content className={styles.overlaycontentnested}>
                                                <div className={styles.nestedDrawerInner}>

                                                    <Drawer.Close asChild>
                                                        <button
                                                            className={styles.closebtn}
                                                            aria-label="Close"
                                                        >
                                                            Close
                                                            <span className={styles.key}>
                                                                Esc
                                                            </span>
                                                        </button>
                                                    </Drawer.Close>
                                                    <div className={styles.drawerHandle} />
                                                    <Drawer.Title className={styles.nestedDrawerTitle}>Breakdown</Drawer.Title>
                                                    <div className={styles.videoWrapper}>


                                                        {signedUrls ? (
                                                            <Video
                                                                autoPlay
                                                                src={signedUrls.signedVideoUrl}
                                                                poster={signedUrls.signedPosterUrl}
                                                                controls
                                                            />
                                                        ) : (
                                                            <p>Loading video...</p>
                                                        )}

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
        </div >
    );
}
