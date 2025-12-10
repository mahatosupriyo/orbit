// components/ui/orbcomponent/orbpost/DownloadButton.tsx

import React, { useState } from "react";
import OrbIcons from "@/components/ui/atomorb/orbicons"; 
import OrbButton from "@/components/ui/atomorb/buttonsorb/buttonorb";

interface DownloadButtonProps {
    url: string;
    filename: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ url, filename }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent opening the lightbox when clicking download

        if (isDownloading) return;
        setIsDownloading(true);

        try {
            // 1. Fetch the image as a blob
            // 'mode: cors' is required for cross-origin signed URLs.
            // 'cache: "no-store"' is CRITICAL: it forces a fresh network request, 
            // bypassing the cached version (from the <img> tag) that lacks CORS headers.
            const response = await fetch(url, { 
                mode: "cors", 
                cache: "no-store" 
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const blob = await response.blob();

            // 2. Create an object URL
            const blobUrl = window.URL.createObjectURL(blob);

            // 3. Create a temporary link to trigger download
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename || "image.jpg";
            document.body.appendChild(link);
            link.click();

            // 4. Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Optional: You could use a toast notification here instead of alert
            alert("Failed to download image. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <OrbButton
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download Original"
            style={{
                cursor: isDownloading ? "wait" : "pointer",
                background: 'transparent',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                padding: '0.8rem',
                borderRadius: '2rem'
            }}
            variant="iconic"
        >
            {isDownloading ? (
                // Simple spinner CSS
                <div
                    style={{
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }}
                />
            ) : (
                <OrbIcons name="downloadimage" fill="#fff" size={30} />
            )}
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </OrbButton>
    );
};