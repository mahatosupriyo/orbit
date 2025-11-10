'use client';

import React, { useEffect, useRef, useState } from 'react';
import OrbModal from '../../orblayout/orbmodal/orbmodal';
import styles from './orbaddpost.module.scss';
import OrbIcons from '../../atomorb/orbicons';
import OrbButton from '../../atomorb/buttonsorb/buttonorb';
import { motion } from 'framer-motion';
import { uploadGaragePost } from '@/server/actions/garage/createpost';

type ImgItem = { id: string; src: string; file?: File };

export default function OrbAddPostModal() {
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState<ImgItem[]>([]);
    const [text, setText] = useState('');
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const modalClose = () => setOpen(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const MAX_IMAGES = 5;
    const MAX_CHARS = 200;
    const MAX_LINES = 10;

    // progress ring setup
    const progress = (text.length / MAX_CHARS) * 100;
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    // focus textarea when modal opens
    useEffect(() => {
        if (open && textareaRef.current) textareaRef.current.focus();
    }, [open]);

    // open with Ctrl/Cmd+P, close with ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const mod = e.altKey || e.metaKey;
            if (mod && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                setOpen(true);
                return;
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // handle paste (images) when modal is open
    useEffect(() => {
        if (!open) return;

        const onPaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            const remaining = MAX_IMAGES - images.length;
            if (remaining <= 0) return;

            const toRead: File[] = [];
            for (let i = 0; i < items.length && toRead.length < remaining; i++) {
                const it = items[i];
                if (it.kind === 'file') {
                    const f = it.getAsFile();
                    if (f && f.type.startsWith('image/')) toRead.push(f);
                } else if (it.type.startsWith('image/')) {
                    const f = it.getAsFile();
                    if (f) toRead.push(f);
                }
            }

            if (toRead.length === 0) return;

            e.preventDefault(); // don't paste binary into textarea

            const readers = toRead.map(
                (file) =>
                    new Promise<ImgItem>((res) => {
                        const r = new FileReader();
                        r.onload = () =>
                            res({
                                id: cryptoRandomId(),
                                src: String(r.result),
                                file,
                            });
                        r.readAsDataURL(file);
                    })
            );

            Promise.all(readers).then((newImgs) => {
                setImages((prev) => [...prev, ...newImgs].slice(0, MAX_IMAGES));
            });
        };

        window.addEventListener('paste', onPaste as any);
        return () => window.removeEventListener('paste', onPaste as any);
    }, [open, images.length]);

    // helper id
    function cryptoRandomId() {
        try {
            return crypto.randomUUID();
        } catch {
            return Math.random().toString(36).slice(2, 9);
        }
    }

    // file input -> add images (respect MAX_IMAGES)
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) {
            // reset input and return
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const chosen = Array.from(files).slice(0, remaining);
        const readers = chosen.map(
            (file) =>
                new Promise<ImgItem>((res) => {
                    const r = new FileReader();
                    r.onload = () =>
                        res({
                            id: cryptoRandomId(),
                            src: String(r.result),
                            file,
                        });
                    r.readAsDataURL(file);
                })
        );

        Promise.all(readers).then((newImgs) => {
            setImages((prev) => [...prev, ...newImgs].slice(0, MAX_IMAGES));
            if (fileInputRef.current) fileInputRef.current.value = '';
        });
    }

    // drag & drop reorder
    const onDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
        e.dataTransfer.setData('text/plain', String(idx));
        e.dataTransfer.effectAllowed = 'move';
    };
    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDropThumb = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
        const from = Number(e.dataTransfer.getData('text/plain'));
        if (Number.isNaN(from)) return;
        setImages((prev) => {
            const copy = prev.slice();
            const [item] = copy.splice(from, 1);
            copy.splice(idx, 0, item);
            return copy;
        });
    };

    function removeImage(id: string) {
        setImages((prev) => prev.filter((p) => p.id !== id));
    }

    // double click to remove
    const onDoubleClickThumb = (id: string) => removeImage(id);

    // textarea change: enforce max chars and max lines, but also sanitize newlines in-place
    function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        let val = e.target.value;

        // normalize CRLF -> LF
        val = val.replace(/\r\n/g, '\n');

        // enforce max lines (hard cap for UI height)
        const lines = val.split(/\n/);
        if (lines.length > MAX_LINES) val = lines.slice(0, MAX_LINES).join('\n');

        // enforce max chars
        if (val.length > MAX_CHARS) val = val.slice(0, MAX_CHARS);

        // collapse more than one blank line into a single blank line (i.e. allow at most one empty line between paragraphs)
        // replace 3+ newlines with exactly two; then replace 2+ with two (safety)
        val = val.replace(/\n{3,}/g, '\n\n').replace(/\n{2,}/g, '\n\n');

        // remove leading / trailing blank lines
        val = val.replace(/^\s*\n+/, '').replace(/\n+\s*$/, '');

        setText(val);
    }

    // helper: convert dataURL -> File
    async function dataUrlToFile(dataUrl: string, filename = 'image.png') {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type || 'image/png' });
    }

    // sanitize & wrap URLs/domains inside markers: #^#...#^#
    function wrapDomains(input: string) {
        if (!input) return input;

        // basic domain/url pattern:
        // matches things like:
        // - https://domain.com/path
        // - http://www.domain.co
        // - www.domain.com
        // - domain.com
        // It will not match emails specifically.
        const urlPattern = /(?:https?:\/\/[^\s#]+|www\.[^\s#]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s#]*)?)/gi;

        // don't double-wrap: if already wrapped (#^#...#^#), skip
        // We'll perform replacement only on matches not already between markers.
        // Simple approach: do a replace but filter out matches that are already inside markers by checking surrounding text.
        return input.replace(urlPattern, (match, offset, full) => {
            // check if match is already inside a marker (#^#...#^#)
            // search backward for '#^#' before offset and forward for '#^#' after end
            const before = full.lastIndexOf('#^#', offset - 1);
            const after = full.indexOf('#^#', offset + match.length);
            if (before !== -1 && after !== -1 && before < offset && after > offset + match.length) {
                // it's inside an existing marker — don't wrap again
                return match;
            }
            return `#^#${match}#^#`;
        });
    }

    // submit
    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (uploading) return;
        if (!text && images.length === 0) return;

        setUploading(true);

        try {
            // final sanitize before sending (same rules as onTextChange)
            let finalText = text.replace(/\r\n/g, '\n');
            finalText = finalText.replace(/\n{3,}/g, '\n\n').replace(/\n{2,}/g, '\n\n');
            finalText = finalText.replace(/^\s*\n+/, '').replace(/\n+\s*$/, '');
            finalText = finalText.trim();

            // wrap domains/urls
            const wrapped = wrapDomains(finalText);

            const formData = new FormData();
            // server expects title and caption — we store wrapped text into title
            formData.append('title', wrapped || 'Untitled');
            formData.append('caption', wrapped || '');

            // prepare files: convert any data-URL images without File -> File
            const filesToAppend: File[] = [];
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (img.file) {
                    filesToAppend.push(img.file);
                } else if (img.src && typeof img.src === 'string' && img.src.startsWith('data:')) {
                    // convert
                    // eslint-disable-next-line no-await-in-loop
                    const file = await dataUrlToFile(img.src, `pasted-${i}.png`);
                    filesToAppend.push(file);
                } else if (img.src && typeof img.src === 'string') {
                    // fallback: try fetching remote image (may be CORS-blocked), attempt best-effort
                    try {
                        // eslint-disable-next-line no-await-in-loop
                        const file = await dataUrlToFile(img.src, `img-${i}.png`);
                        filesToAppend.push(file);
                    } catch {
                        // skip this image if cannot fetch
                    }
                }
            }

            // append images to FormData
            filesToAppend.forEach((file) => {
                formData.append('images', file);
            });

            // call server action
            const res = await uploadGaragePost(formData);

            if (res?.success) {
                // success
                setText('');
                setImages([]);
                setOpen(false);
                try {
                    // eslint-disable-next-line no-alert
                    alert('Post uploaded successfully');
                } catch {
                    // ignore
                }
            } else {
                // server returned a failure
                // eslint-disable-next-line no-alert
                alert(res?.message || 'Upload failed');
            }
        } catch (err: any) {
            console.error('Upload failed', err);
            // eslint-disable-next-line no-alert
            alert(err?.message || 'Upload failed unexpectedly');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    const currentLines = text.split(/\r?\n/).length;

    return (
        <>
            <motion.div whileTap={{ scale: 0.96 }}>
                <OrbButton
                    variant={open ? 'active' : 'iconic'}
                    onClick={() => setOpen(true)}
                    title="Add Post (Alt + P)"
                >
                    <OrbIcons name="add" size={30} fill={open ? '#000' : '#fff'} />
                </OrbButton>
            </motion.div>

            <OrbModal isOpen={open} onClose={modalClose}>
                <form
                    className={styles.formcontainer}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSubmit(e);
                    }}
                >
                    <div className={styles.body}>
                        <div className={styles.writerRow}>
                            <textarea
                                className={styles.txtinput}
                                placeholder="Share your story"
                                value={text}
                                ref={textareaRef}
                                onChange={onTextChange}
                                rows={Math.min(10, Math.max(3, currentLines))}
                                disabled={uploading}
                            />

                            <div className={styles.controls}></div>
                        </div>
                    </div>

                    <div className={styles.thumbsRow}>
                        {images.map((img, idx) => (
                            <div
                                key={img.id}
                                className={styles.thumb}
                                draggable
                                onDragStart={(e) => onDragStart(e, idx)}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDropThumb(e, idx)}
                                onDoubleClick={() => onDoubleClickThumb(img.id)}
                                title="Drag to arrange — Double click to remove"
                            >
                                <img src={img.src} alt={`thumb-${idx}`} />
                                <button
                                    type="button"
                                    className={styles.removeImageBtn}
                                    onClick={() => removeImage(img.id)}
                                    aria-label="Remove image"
                                    disabled={uploading}
                                >
                                    <OrbIcons name="close" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.bottomlayer}>
                        <div className={styles.actions}>
                            <label
                                className={styles.iconBtn}
                                title={images.length >= MAX_IMAGES ? 'Max images reached' : 'Add image'}
                                style={{
                                    pointerEvents: images.length >= MAX_IMAGES || uploading ? 'none' : undefined,
                                    opacity: images.length >= MAX_IMAGES || uploading ? 0.5 : undefined,
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    disabled={images.length >= MAX_IMAGES || uploading}
                                />
                                <OrbIcons name="image" size={36} />
                            </label>
                        </div>

                        <div className={styles.footerActions}>
                            {/* progress ring */}
                            <div className={styles.progresscircle} aria-hidden>
                                <svg width="20" height="20">
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r={radius}
                                        stroke="hsla(0, 0%, 24%, 1.00)"
                                        strokeWidth="1.2"
                                        fill="none"
                                    />
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r={radius}
                                        stroke="#3b82f6"
                                        strokeWidth="1.2"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        transform="rotate(-90 10 10)"
                                    />
                                </svg>
                            </div>

                            <OrbButton
                                type="button"
                                className={styles.uploadBtn}
                                onClick={() => void handleSubmit()}
                                disabled={uploading || text.trim().length === 0 || images.length === 0}
                                style={{ padding: '1rem', borderRadius: '2rem' }}
                                variant="active"
                            >
                                <span className={styles.label}>{uploading ? 'Adding' : 'Add'}</span>
                            </OrbButton>
                        </div>
                    </div>
                </form>
            </OrbModal>
        </>
    );
}