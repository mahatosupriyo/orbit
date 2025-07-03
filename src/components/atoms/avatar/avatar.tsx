'use client';

import React, { useEffect } from 'react';
import { useAvatarStore } from '@/app/store/avatarStore';
import { getAvatar } from '@/app/actions/getAvatar';

interface AvatarImageProps {
  className?: string;
  size?: number;
}

export default function AvatarImage({ className = '', size = 32 }: AvatarImageProps) {
  const avatarUrl = useAvatarStore((state) => state.avatarUrl);
  const setAvatarUrl = useAvatarStore((state) => state.setAvatarUrl);

  useEffect(() => {
    if (avatarUrl) return;

    const fetchAvatar = async () => {
      try {
        const url = await getAvatar();
        setAvatarUrl(url);
      } catch (err) {
        console.error("Failed to fetch avatar:", err);
        setAvatarUrl('https://ontheorbit.com/placeholder.png');
      }
    };

    fetchAvatar();
  }, [avatarUrl, setAvatarUrl]);

  return (
    <img
      src={avatarUrl || 'https://ontheorbit.com/placeholder.png'}
      alt="User avatar"
      className={className}
      height={size}
      width={size}
      style={{
        // width: '100%',
        // height: '100%',
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
