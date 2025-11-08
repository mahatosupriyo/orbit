'use client';

import React, { useEffect, useRef, useState } from 'react';
import OrbModal from '../../orblayout/orbmodal/orbmodal'; // your simplified modal wrapper
import styles from './orbaddpost.module.scss';
import OrbIcons from '../../atomorb/orbicons';
import OrbButton from '../../atomorb/buttonsorb/buttonorb';
import { motion } from 'framer-motion';

type ImgItem = { id: string; src: string; file?: File };

export default function OrbAddPostModal() {
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState<ImgItem[]>([]);
    const [text, setText] = useState('');
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

    // textarea change: enforce max chars and max lines
    function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        let val = e.target.value;
        // enforce lines
        const lines = val.split(/\r?\n/);
        if (lines.length > MAX_LINES) val = lines.slice(0, MAX_LINES).join('\n');
        // enforce chars
        if (val.length > MAX_CHARS) val = val.slice(0, MAX_CHARS);
        setText(val);
    }


    // submit
    function handleSubmit() {
        const payload = { text, images: images.map((i) => i.file ?? i.src) };
        console.log('submit', payload);
        setOpen(false);
        setText('');
        setImages([]);
    }

    const remainingChars = MAX_CHARS - text.length;
    const currentLines = text.split(/\r?\n/).length;

    return (
        <>
            <motion.div
                whileTap={{ scale: 0.96 }}
            >
                <OrbButton
                    variant={open ? 'active' : 'iconic'}
                    onClick={() => setOpen(true)}
                    title="Add Post (Alt + P)"
                >
                    <OrbIcons name="add" size={30} fill={open ? '#000' : '#fff'} />
                </OrbButton>
            </motion.div>

            <OrbModal isOpen={open} onClose={modalClose}>
                <form className={styles.formcontainer}>

                    <div className={styles.body}>

                        <div className={styles.writerRow}>
                            <textarea
                                className={styles.txtinput}
                                placeholder="Share your story"
                                value={text}
                                ref={textareaRef}
                                onChange={onTextChange}
                                rows={Math.min(10, Math.max(3, currentLines))}
                            />

                            <div className={styles.controls}>

                            </div>
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
                                {/* Close button for each image (calls removeImage with the specific id) */}
                                <button
                                    type="button"
                                    className={styles.removeImageBtn}
                                    onClick={() => removeImage(img.id)}
                                    aria-label="Remove image"
                                >
                                    <OrbIcons name='close' />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.bottomlayer}>
                        <div className={styles.actions}>
                            {/* label contains input; clicking label triggers file selector once */}
                            <label
                                className={styles.iconBtn}
                                title={images.length >= MAX_IMAGES ? 'Max images reached' : 'Add image'}
                                // make label non-interactive when max reached
                                style={{
                                    pointerEvents: images.length >= MAX_IMAGES ? 'none' : undefined,
                                    opacity: images.length >= MAX_IMAGES ? 0.5 : undefined,
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    disabled={images.length >= MAX_IMAGES}
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
                                className={styles.uploadBtn}
                                onClick={handleSubmit}
                                disabled={!text && images.length === 0}
                                style={{ padding: '1rem', borderRadius: '2rem' }}
                                variant="active"
                            >
                                <span className={styles.label}>Add</span>
                            </OrbButton>
                        </div>
                    </div>



                </form>
            </OrbModal>
        </>
    );
}
