"use client";
import React from 'react';
import Link from 'next/link';
import styles from './videochip.module.scss';
import Icon from '../icons';

interface VideoChipProps {
    videourl: string;
    imageBanner: string;
    label: string;
    title: string;
    premium?: boolean;
}

/**
 * VideoChip component
 * - Displays a clickable video card with banner, label, and title.
 * - Shows a lock icon if the video is premium.
 * - Uses Next.js Link for navigation.
 */
export default function VideoChip({ videourl, imageBanner, label, title, premium = false }: VideoChipProps) {
    return (
        <div className={styles.videochipwraper}>
            {/* Video link wraps the entire chip */}
            <Link draggable="false" href={videourl} className={styles.videolink}>
                {/* Video banner image */}
                <img
                    src={imageBanner}
                    draggable="false"
                    className={styles.videobanner}
                    alt={title}
                />
                <div className={styles.videoinfo}>
                    <div className={styles.detailwraper}>
                        {/* Video label and title */}
                        <p className={styles.label}>{label}</p>
                        <h3 className={styles.videotitle}>{title}</h3>
                    </div>
                    <div className={styles.iconwraper}>
                        {/* Lock icon for premium videos */}
                        {premium && <Icon fill='#fff' size={20} name='lock' />}
                    </div>
                </div>
            </Link>
        </div>
    );
}