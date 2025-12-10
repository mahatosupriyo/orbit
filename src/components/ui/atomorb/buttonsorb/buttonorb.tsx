"use client"
import React from 'react';
import styles from '@/components/ui/atomorb/buttonsorb/buttonorb.module.scss';
/**
 * ButtonProps interface
 * - Extends standard button attributes.
 * - Supports optional variant and fullWidth props for styling.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'disabled' | 'iconic' | 'active' | 'fullwidth';
  fullWidth?: boolean;
}

/**
 * Button component
 * - Renders a styled button with optional variants and full width.
 * - Accepts all standard button props.
 * - Applies custom styles based on props.
 */
const OrbButton: React.FC<ButtonProps> = ({
  variant = 'default',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  // Compose the button's className based on props
  const buttonClass = `
    ${styles.orbbutton} 
    ${styles[variant]} 
    ${fullWidth ? styles.fullWidth : ''} 
    ${className}
  `;

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default OrbButton;