// components/ui/Button.tsx
"use client";

import Link from "next/link";
import styles from "./buttonorb.module.scss";
import clsx from "clsx";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Define all accepted props
interface ButtonProps {
    href: string;
    children: ReactNode;
    variant?: "primary" | "iconic" | "secondary" | "outline" | "text";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    active?: boolean;
    className?: string;
}

// Industry-standard component using Next.js Link
export default function LnkOrbButton({
    href,
    children,
    variant = "primary",
    size = "md",
    active,
    disabled = false,
    className,
}: ButtonProps) {
    // Combine class names dynamically using clsx

    const pathname = usePathname();

    // Determine if the button should be active
    const isActive = active ?? pathname === href;

    // Combine class names dynamically using clsx
    const buttonClass = clsx(
        styles.orbbutton,
        styles[variant],
        styles[size],
        {
            [styles.disabled]: disabled,
            [styles.active]: isActive, // active state class
        },
        className
    );

    // When disabled, prevent navigation
    if (disabled) {
        return (
            <span className={buttonClass} aria-disabled="true">
                {children}
            </span>
        );
    }

    return (
        <motion.div
            whileTap={{
                scale: 0.96,
                overflow: 'hidden',
                // opacity: 0.8
            }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Link href={href} draggable="false" style={{ textDecoration: 'none' }} className={buttonClass}>
                {children}
            </Link>
        </motion.div>
    );
}
