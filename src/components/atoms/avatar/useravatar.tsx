'use client';

import React, { useEffect, useState } from 'react';
import { getAvatarByUserId } from './getAvatarbyID';

interface AvatarImageProps {
    userId: string;
    className?: string;
    size?: number;
}

export default function AvatarImageForUser({ userId, className = '', size = 32 }: AvatarImageProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchAvatar = async () => {
            try {
                const url = await getAvatarByUserId(userId);
                setAvatarUrl(url);
            } catch (err) {
                console.error("Failed to fetch avatar:", err);
                setAvatarUrl('https://ontheorbit.com/placeholder.png');
            }
        };

        fetchAvatar();
    }, [userId]);

    return (
        <img
            src={avatarUrl || 'https://ontheorbit.com/placeholder.png'}
            alt="User avatar"
            className={className}
            height={size}
            width={size}
            style={{
                borderRadius: '50rem',
                objectFit: 'cover',
                aspectRatio: '1/1',
                objectPosition: 'center',
                userSelect: 'none',
                pointerEvents: 'none',
            }}
            draggable="false"
            onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://ontheorbit.com/placeholder.png';
            }}
        />
    );
}
