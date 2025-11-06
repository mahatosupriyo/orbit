'use client';
import { useState, useEffect, useRef } from 'react';
import OrbButton from '@/components/ui/atomorb/buttonsorb/buttonorb';
import OrbModal from '@/components/ui/orblayout/orbmodal/orbmodal';
import OrbIcons from '../../atomorb/orbicons';
import styles from './orbsearch.module.scss';
import { motion } from 'framer-motion';

/**
 * OrbSearchComponent
 * - supports file input + paste image from clipboard
 * - shows a single-preview thumbnail replacing the image input area
 * - on submit produces FormData { text, image } and demonstrates how to send it
 * - supports Ctrl + / (or Cmd + /) to toggle modal
 */
export default function OrbSearchComponent() {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const iconsize = 30;
    const maxChars = 100;

    // progress ring setup
    const progress = (text.length / maxChars) * 100;
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    // focus textarea when modal opens
    useEffect(() => {
        if (open && textareaRef.current) textareaRef.current.focus();
    }, [open]);

    // cleanup image preview URLs
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    // --- ✅ Keyboard shortcut: Ctrl + / or Cmd + /
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.code === 'Slash')) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- handle file picker change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) return;

        setImageFile(file);

        const url = URL.createObjectURL(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(url);
    };

    // --- handle paste image
    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const blob = item.getAsFile();
                if (!blob) continue;

                const file = new File([blob], `pasted-image.${blob.type.split('/')[1] || 'png'}`, {
                    type: blob.type,
                });

                setImageFile(file);
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setImagePreview(URL.createObjectURL(file));
                break;
            }
        }
    };

    // --- remove image
    const removeImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() && !imageFile) return;

        const form = new FormData();
        form.append('text', text);
        if (imageFile) form.append('image', imageFile);

        console.log('Submitting', { text, imageFile });

        setOpen(false);
        setText('');
        removeImage();
    };

    // open file picker
    const triggerFilePicker = () => {
        fileInputRef.current?.click();
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <motion.div
                whileTap={{ scale: 0.96 }}
            >
                <OrbButton
                    variant={open ? 'active' : 'iconic'}
                    onClick={() => setOpen(true)}
                    title="Open Search (Ctrl + /)"
                >
                    <OrbIcons name="search" size={iconsize} fill={open ? '#000' : '#fff'} />
                </OrbButton>
            </motion.div>

            <OrbModal isOpen={open} onClose={() => setOpen(false)}>
                <form className={styles.formcontainer} onSubmit={handleSubmit}>
                    <div className={styles.textwrapper}>
                        <textarea
                            ref={textareaRef}
                            placeholder="Search anything"
                            maxLength={maxChars}
                            value={text}
                            spellCheck={false}
                            onChange={(e) => setText(e.target.value)}
                            onPaste={handlePaste}
                            className={styles.txtinput}
                        />
                    </div>

                    <div className={styles.bottomlayer}>
                        {/* image input / preview */}
                        <div className={styles.imageinput}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {imagePreview ? (
                                <div className={styles.previewWrapper}>
                                    <img src={imagePreview} alt="preview" className={styles.previewImg} />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={removeImage}
                                        aria-label="Remove image"
                                    >
                                        <OrbIcons name='close' />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.uploadBtn}
                                    onClick={triggerFilePicker}
                                >
                                    <OrbIcons name="image" size={30} fill="#fff" />
                                </button>
                            )}
                        </div>

                        <div className={styles.useract}>
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
                            <motion.div
                                whileTap={{ scale: 0.96 }}
                            >
                                <OrbButton
                                    type="submit"
                                    style={{ padding: '1rem', borderRadius: '2rem' }}
                                    variant="active"
                                >
                                    Search
                                </OrbButton>
                            </motion.div>
                        </div>
                    </div>
                </form>
            </OrbModal>
        </div>
    );
}
