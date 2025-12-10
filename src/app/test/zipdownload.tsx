"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import OrbIcons from "@/components/ui/atomorb/orbicons"; // Adjust path as needed
import OrbButton from "@/components/ui/atomorb/buttonsorb/buttonorb"; // Adjust path as needed

interface DownloadZipButtonProps {
    images: { id: number; url: string }[];
    username: string;
    postId: number;
}

export const DownloadZipButton: React.FC<DownloadZipButtonProps> = ({ images, username, postId }) => {
    const [isZipping, setIsZipping] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleZipDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isZipping) return;
        setIsZipping(true);
        setProgress(0);

        try {
            const zip = new JSZip();
            // Create a folder inside the zip so when extracted it's not messy
            const folderName = `${username}-post-${postId}`;
            const folder = zip.folder(folderName);

            if (!folder) throw new Error("Failed to create zip folder");

            let completedCount = 0;

            // Fetch all images in parallel
            const downloadPromises = images.map(async (img, index) => {
                try {
                    // CRITICAL: cache: "no-store" ensures we bypass the cached CORS-less image
                    const response = await fetch(img.url, {
                        mode: "cors",
                        cache: "no-store"
                    });

                    if (!response.ok) throw new Error(`Failed to fetch image ${img.id}`);

                    const blob = await response.blob();

                    // Name the files sequentially: username-post-id-img-1.jpg
                    const filename = `${username}-post-${postId}-img-${index + 1}.jpg`;
                    folder.file(filename, blob);
                } catch (err) {
                    console.error(`Failed to download image ${img.id}`, err);
                    // You might want to continue even if one fails
                } finally {
                    completedCount++;
                    // Update progress for user feedback
                    setProgress(Math.round((completedCount / images.length) * 100));
                }
            });

            await Promise.all(downloadPromises);

            // Generate zip file as a Blob
            const content = await zip.generateAsync({ type: "blob" });

            // Trigger download
            saveAs(content, `${folderName}.zip`);

        } catch (error) {
            console.error("Zip creation failed:", error);
            alert("Failed to download zip. Please try again.");
        } finally {
            setIsZipping(false);
            setProgress(0);
        }
    };

    return (
        <OrbButton
            onClick={handleZipDownload}
            disabled={isZipping}
            title="Download All as ZIP"
            style={{
                cursor: isZipping ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                padding: '0.8rem',
                borderRadius: '2rem',
                transition: "all 0.2s ease",
            }}
            variant="iconic"
        >
            {isZipping ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                        style={{
                            width: "10px",
                            height: "10px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                        }}
                    />
                    {progress}%
                </span>
            ) : (
                <>
                    <OrbIcons name="downloadimage" fill="#fff" size={30} />
                    {/* <span>Download All ({images.length})</span> */}
                </>
            )}
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </OrbButton>
    );
};