import React from 'react';
import styles from '@/components/atoms/button/button.module.scss';

/**
 * ButtonProps interface
 * - Extends standard button attributes.
 * - Supports optional variant and fullWidth props for styling.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'disabled' | 'fullwidth';
  fullWidth?: boolean;
}

/**
 * Button component
 * - Renders a styled button with optional variants and full width.
 * - Accepts all standard button props.
 * - Applies custom styles based on props.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  // Compose the button's className based on props
  const buttonClass = `
    ${styles.button} 
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

export default Button;