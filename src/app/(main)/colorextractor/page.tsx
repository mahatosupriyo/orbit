"use client";

// ColorExtractor: Extracts dominant and palette colors from uploaded images.

import { useState, useRef } from "react";
import ColorThief from "colorthief";
import styles from "./colorextractor.module.scss";
import NavBar from "@/components/molecules/navbar/navbar";
import { toast } from "react-hot-toast";
import BackBtn from "@/components/atoms/(buttons)/backbtn/backbtn";

export default function ColorExtractor() {
    // State for dominant color, palette, image source, and drag state
    const [dominant, setDominant] = useState<string | null>(null);
    const [palette, setPalette] = useState<string[]>([]);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Refs for image and file input
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection and read as DataURL
    const handleFiles = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setDominant(null);
            setPalette([]);
        };
        reader.readAsDataURL(file);
    };

    // Handle file input change
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    // Handle drag events for drag-and-drop UI
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle file drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    // Extract colors using ColorThief after image loads
    const extractColors = () => {
        if (!imgRef.current) return;
        const colorThief = new ColorThief();

        // Ensure image is loaded before processing
        if (imgRef.current.complete) {
            processImage(colorThief);
        } else {
            imgRef.current.onload = () => processImage(colorThief);
        }
    };

    // Process image to get dominant and palette colors
    const processImage = (colorThief: ColorThief) => {
        if (!imgRef.current) return;
        try {
            const dominantColor = colorThief.getColor(imgRef.current);
            const paletteColors = colorThief.getPalette(imgRef.current, 4);

            setDominant(rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]));
            setPalette(
                paletteColors.map(([r, g, b]: [number, number, number]) =>
                    rgbToHex(r, g, b)
                )
            );
        } catch (error) {
            toast.error("Failed to extract colors. Try another image.");
        }
    };

    // Convert RGB to HEX
    const rgbToHex = (r: number, g: number, b: number) =>
        "#" +
        [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

    // Copy HEX color to clipboard
    const copyToClipboard = (hex: string) => {
        navigator.clipboard.writeText(hex);
        toast.success(`Copied ${hex}`);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Navigation Bar */}
            <NavBar />
            <div className={styles.wrapper}>
                <BackBtn />
                <div className={styles.subcontainer}>
                    {/* Drag & Drop Zone */}
                    <div className={styles.dropper}>
                        <div
                            className={`${styles.dropZone} ${dragActive ? styles.active : ""}`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            tabIndex={0}
                            role="button"
                            aria-label="Upload image by clicking or dragging"
                        >
                            <p>Drag and Drop</p>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleUpload}
                                style={{ display: "none" }}
                                aria-label="Image file input"
                            />
                        </div>
                    </div>

                    {/* Image Preview and Color Palette */}
                    {imageSrc && (
                        <div
                            className={styles.imageWrapper}
                            style={{ backgroundColor: dominant || "#fff" }}
                        >
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                crossOrigin="anonymous"
                                alt="Uploaded preview"
                                onLoad={extractColors}
                                className={styles.previewImage}
                            />

                            <div className={styles.colors}>
                                {(dominant || palette.length > 0) && (
                                    <div className={styles.section}>
                                        <div className={styles.palette}>
                                            {/* Dominant Color */}
                                            {dominant && (
                                                <button
                                                    key="dominant"
                                                    onClick={() => copyToClipboard(dominant)}
                                                    className={styles.circleSmall}
                                                    style={{ backgroundColor: dominant }}
                                                    title="Dominant Color"
                                                    aria-label={`Copy dominant color ${dominant}`}
                                                    type="button"
                                                />
                                            )}
                                            {/* Palette Colors */}
                                            {palette.map((hex, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => copyToClipboard(hex)}
                                                    className={styles.circleSmall}
                                                    style={{ backgroundColor: hex }}
                                                    title={`Palette Color ${hex}`}
                                                    aria-label={`Copy palette color ${hex}`}
                                                    type="button"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
