"use client";

import React, { useState } from "react";
import OrbIcons from "@/components/ui/atomorb/orbicons"; // Adjust path
import OrbButton from "@/components/ui/atomorb/buttonsorb/buttonorb"; // Adjust path

interface CopyLinkButtonProps {
    postId: number;
    username: string;
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({ postId, username }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Construct the URL. Adjust this format to match your actual routing.
        // Example: https://ontheorbit.com/username/status/123 or /p/123
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url = `${origin}/${username}/post/${postId}`;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            
            // Reset "Copied" state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <OrbButton
            onClick={handleCopy}
            title="Copy link to post"
            style={{
                cursor: "pointer",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: copied ? "#4ade80" : "#fff", // Green when copied, white otherwise
                transition: "all 0.2s ease",
                padding: "0.4rem",
            }}
            variant="iconic"
        >
            {copied ? (
                // Success State (Checkmark)
                <OrbIcons name="copyimage" fill="#4ade80" size={20} />
            ) : (
                // Default State (Link/Copy Icon)
                // Ensure you have a 'link' or 'copy' icon in OrbIcons
                <OrbIcons name="copyimage" fill="#fff" size={20} />
            )}
        </OrbButton>
    );
};