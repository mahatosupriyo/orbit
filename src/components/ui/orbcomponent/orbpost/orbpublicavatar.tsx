"use client";
import React from "react";
import styles from "./orbpost.module.scss";

/**
 * Avatar component for displaying user profile pictures.
 * 
 * Renders a circular avatar image with a decorative line below it.
 * Falls back to a placeholder image if no avatar URL is provided.
 * 
 * @component
 * @example
 * ```tsx
 * <Avatar username="john_doe" avatarUrl="https://example.com/avatar.jpg" />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} props.username - The username associated with the avatar
 * @param {string} [props.avatarUrl] - Optional URL to the avatar image. Uses fallback if not provided
 * @returns {React.ReactElement} Rendered avatar element with styling
 */
export default function PublicAvatar({
    username,
    avatarUrl,
}: {
    username: string;
    avatarUrl?: string;
}): React.ReactElement {
    // Fallback image URL when user avatar is unavailable
    const FALLBACK_AVATAR = "https://ontheorbit.com/placeholder.png";

    return (
        <div className={styles.avatarwraper}>
            <img
                style={{ userSelect: 'none', pointerEvents: 'none' }}
                draggable={false}
                src={avatarUrl || FALLBACK_AVATAR}
                alt={`${username} avatar`}
                className={styles.avatar}
            />
        </div>
    );
}
