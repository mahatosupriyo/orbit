// components/loaders/ShimmerLoader.tsx
import React from 'react';
import styles from './loadingbox.module.scss';

type ShimmerLoaderProps = {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
};

const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '8px',
  style,
  className = '',
}) => {
  return (
    <div
      className={`${styles.shimmer} ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
};

export default ShimmerLoader;
