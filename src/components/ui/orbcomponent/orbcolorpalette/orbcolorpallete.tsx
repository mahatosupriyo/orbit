"use client";
import React, { JSX, useEffect, useRef, useState } from "react";
import OrbIcons from "../../atomorb/orbicons";
import styles from "./orbcolorpallete.module.scss";
import Lottie from "lottie-react";
import animationData from '../../../../../public/Essentials/lottie/orbcolors.json'

/**
 * OrbColorPalette (TypeScript)
 * - drag & drop
 * - paste (Ctrl+V)
 * - "Drop here +" overlay while dragging
 * - extracts colors using ColorThief (dynamic import)
 * - dominant color applied as gradient to image container
 * - fixes double-upload glitch
 * - copy-to-clipboard animations (0.6s)
 */

export default function OrbColorPalette(): JSX.Element {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [dominant, setDominant] = useState<string | null>(null);
    const [palette, setPalette] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // -1 = dominant, 0.. = palette
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const uploadLockRef = useRef(false); // prevent double uploads

    // Read file and set data URL
    const handleFiles = (file: File | null) => {
        if (!file) return;
        if (!file.type?.startsWith?.("image/")) {
            console.warn("Not an image file");
            return;
        }

        // short lock to prevent double processing
        if (uploadLockRef.current) return;
        uploadLockRef.current = true;
        window.setTimeout(() => {
            uploadLockRef.current = false;
        }, 700);

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setDominant(null);
            setPalette([]);
        };
        reader.readAsDataURL(file);
    };

    // File input onChange
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        handleFiles(file);
        // allow re-selecting same file
        e.currentTarget.value = "";
    };

    // Drag handlers
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = e.dataTransfer?.files;
        if (files && files[0]) handleFiles(files[0]);
    };

    // Paste (Ctrl+V) support
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!e.clipboardData) return;
            const items = Array.from(e.clipboardData.items || []);
            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) {
                        handleFiles(file);
                        e.preventDefault();
                        break;
                    }
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    // Convert RGB to HEX
    const rgbToHex = (r: number, g: number, b: number) =>
        "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

    // Darken hex color by amount (0..1)
    const darkenHex = (hex: string, amount = 0.35) => {
        try {
            const parsed = hex.replace("#", "");
            const r = parseInt(parsed.substring(0, 2), 16);
            const g = parseInt(parsed.substring(2, 4), 16);
            const b = parseInt(parsed.substring(4, 6), 16);
            const newR = Math.max(0, Math.floor(r * (1 - amount)));
            const newG = Math.max(0, Math.floor(g * (1 - amount)));
            const newB = Math.max(0, Math.floor(b * (1 - amount)));
            return rgbToHex(newR, newG, newB);
        } catch {
            return hex;
        }
    };

    // extract colors using ColorThief (dynamic import)
    const extractColors = async () => {
        if (!imgRef.current) return;
        try {
            const module = await import("colorthief");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ColorThiefClass: any = (module as any)?.default ?? module;
            const colorThief = new ColorThiefClass();

            if (imgRef.current.complete) {
                processImage(colorThief);
            } else {
                imgRef.current.onload = () => processImage(colorThief);
            }
        } catch (err) {
            console.warn("Failed to load ColorThief or extract colors", err);
        }
    };

    // process image and set colors
    const processImage = (colorThief: any) => {
        if (!imgRef.current) return;
        try {
            const dominantRgb: [number, number, number] = colorThief.getColor(imgRef.current);
            const paletteRgb: [number, number, number][] =
                colorThief.getPalette(imgRef.current, 4) || [];

            setDominant(rgbToHex(dominantRgb[0], dominantRgb[1], dominantRgb[2]));
            setPalette(paletteRgb.map((p) => rgbToHex(p[0], p[1], p[2])));
        } catch (err) {
            console.warn("Color extraction failed", err);
        }
    };

    const copyToClipboard = async (hex: string, idx: number) => {
        try {
            await navigator.clipboard.writeText(hex);
            // show animation badge on the clicked swatch
            setCopiedIndex(idx);
            setTimeout(() => setCopiedIndex(null), 600); // 0.6s animation
            console.log(`Copied ${hex}`);
        } catch {
            console.warn("Clipboard write failed");
        }
    };

    // computed style for gradient using dominant color
    const computeBackground = (hex: string | null) => {
        if (!hex) return undefined;
        const dark = darkenHex(hex, 0.6);
        return `${dark}`;
    };

    return (
        <div className={styles.componentwraper}>
            <div
                className={styles.imageBackground}
                style={{
                    background: computeBackground(dominant) ?? "transparent",
                }}
            >

            </div>
            {/* Palette row: show only after user provided an image and a dominant color */}
            {imageSrc && dominant && (
                <div className={styles.swatchesRow} aria-hidden={false}>
                    <div className={styles.swatchWrapper}>
                        <button
                            key="dominant"
                            className={styles.swatch}
                            style={{ backgroundColor: `${dominant}` }}
                            onClick={() => copyToClipboard(dominant, -1)}
                            title={`Dominant color ${dominant}`}
                            aria-label={`Copy dominant color ${dominant}`}
                            type="button"
                        />
                        <div
                            className={`${styles.copyBadge} ${copiedIndex === -1 ? styles.visible : ""}`}
                            aria-hidden="true"
                        >
                            {/* demo check icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" />
                            </svg>
                        </div>
                    </div>
                    {palette.map((hex, idx) => (
                        <div key={hex + idx} className={styles.swatchWrapper}>
                            <button
                                className={styles.swatch}
                                style={{ backgroundColor: `${hex}` }}
                                onClick={() => copyToClipboard(hex, idx)}
                                title={hex}
                                aria-label={`Copy palette color ${hex}`}
                                type="button"
                            />
                            <div
                                className={`${styles.copyBadge} ${copiedIndex === idx ? styles.visible : ""}`}
                                aria-hidden="true"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload / Drop zone */}
            <div
                className={`${styles.uploadbtnwraper} ${dragActive ? styles.dragging : ""}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload or paste image"
            >
                {/* HIDDEN input to avoid double-click glitch — wrapper handles the click */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.fileuploader}
                    onChange={handleUpload}
                    aria-label="Image file input"
                    style={{ display: "none" }}
                />

                <span className={styles.subwraper}>
                    <OrbIcons name="image" size={36} fill="#fff" />
                </span>
                <h2 className={styles.mainlabel}>
                    {dragActive ? 'Drop here +' : 'Drag and Drop'}
                </h2>
            </div>

            {!imageSrc && (
                <Lottie
                    animationData={animationData}
                    style={{ height: '100%', maxWidth: '80rem', boxSizing: 'content-box' }}
                    autoplay
                />
            )}

            {/* <Lottie animationData={animationData} style={{ height: '400px', padding: '4rem', boxSizing: 'content-box' }} autoplay /> */}

            {/* Preview: apply gradient if we have dominant color */}
            {imageSrc && (
                <div
                    className={styles.imageWrapper}
                >
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Preview"
                        crossOrigin="anonymous"
                        onLoad={() => void extractColors()}
                        className={styles.previewImage}
                    />
                </div>
            )}
        </div>
    );
}
