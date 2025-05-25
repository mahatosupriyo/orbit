import React from 'react';
import styles from '@/components/atoms/button/button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'disabled' | 'fullwidth';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
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
