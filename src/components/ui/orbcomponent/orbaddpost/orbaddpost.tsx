// OrbAddPostModal.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_IMAGES = 5;
  const MAX_CHARS = 500;
  const MAX_LINES = 15;

  // svg progress circle constants
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const charCount = text.length;
  const progress = Math.min(charCount / MAX_CHARS, 1);
  const dashOffset = circumference - progress * circumference;
  const progressColor = charCount >= MAX_CHARS ? '#ef4444' : '#3b82f6';

  // focus textarea when opening modal
  useEffect(() => {
    if (open && textareaRef.current) {
      const t = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // keyboard shortcuts
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

  // paste images (Ctrl/Cmd+V from clipboard)
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
        }
      }
      if (toRead.length === 0) return;
      e.preventDefault();

      const readers = toRead.map((file) =>
        new Promise<ImgItem>((res) => {
          const r = new FileReader();
          r.onload = () => res({ id: cryptoRandomId(), src: String(r.result), file });
          r.readAsDataURL(file);
        })
      );

      Promise.all(readers).then((newImgs) => {
        setImages((prev) => [...prev, ...newImgs].slice(0, MAX_IMAGES));
      });
    };

    window.addEventListener('paste', onPaste as any);
    return () => window.removeEventListener('paste', onPaste as any);
    // images.length intentionally included so we know available slots
  }, [open, images.length]);

  const cryptoRandomId = useCallback(() => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).slice(2, 9);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const chosen = Array.from(files).slice(0, remaining);
    const readers = chosen.map((file) =>
      new Promise<ImgItem>((res) => {
        const r = new FileReader();
        r.onload = () => res({ id: cryptoRandomId(), src: String(r.result), file });
        r.readAsDataURL(file);
      })
    );

    Promise.all(readers).then((newImgs) => {
      setImages((prev) => [...prev, ...newImgs].slice(0, MAX_IMAGES));
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  }, [images.length, MAX_IMAGES, cryptoRandomId]);

  // drag & drop reorder
  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const onDropThumb = useCallback((e: React.DragEvent<HTMLDivElement>, idx: number) => {
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from)) return;
    setImages((prev) => {
      const copy = prev.slice();
      const [item] = copy.splice(from, 1);
      copy.splice(idx, 0, item);
      return copy;
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const onDoubleClickThumb = useCallback((id: string) => removeImage(id), [removeImage]);

  // text change: normalize CRLF -> LF, enforce max chars and max lines
  const onTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    // normalize line endings
    val = val.replace(/\r\n/g, '\n');

    // enforce max chars
    if (val.length > MAX_CHARS) val = val.slice(0, MAX_CHARS);

    // enforce max lines (counts empty lines too)
    const lines = val.split('\n');
    if (lines.length > MAX_LINES) {
      val = lines.slice(0, MAX_LINES).join('\n');
    }

    // do not collapse multiple blank lines here — user expects what they type preserved
    setText(val);
  }, [MAX_CHARS, MAX_LINES]);

  // helper to convert dataURL to File (for pasted external images)
  async function dataUrlToFile(dataUrl: string, filename = 'image.png') {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
  }

  const hasText = text.trim().length > 0;
  const canSubmit = !uploading && (hasText || images.length > 0) && images.length <= MAX_IMAGES;

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (uploading) return;

    // require text when there are images (as the original logic required title/text with images)
    if (images.length > 0 && !hasText) {
      alert('A title/text is required when uploading images.');
      return;
    }

    if (!hasText && images.length === 0) return;

    setUploading(true);

    try {
      // normalize line endings and trim leading/trailing whitespace but preserve internal newlines
      let finalText = text.replace(/\r\n/g, '\n');
      finalText = finalText.replace(/^\s+/, '').replace(/\s+$/, ''); // remove leading/trailing whitespace/newlines
      // note: do NOT collapse multiple consecutive newlines — preserve user's formatting

      const formData = new FormData();
      formData.append('title', finalText || '');
      formData.append('caption', finalText || '');

      const filesToAppend: File[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.file) filesToAppend.push(img.file);
        else if (img.src && typeof img.src === 'string') {
          try {
            const filename = img.src.startsWith('data:') ? `pasted-${i}.png` : `img-${i}.png`;
            const file = await dataUrlToFile(img.src, filename);
            filesToAppend.push(file);
          } catch (err) {
            // if a pasted URL fails to convert, skip it rather than blocking the whole upload
            // console.warn('Failed converting image src to file', err);
          }
        }
      }

      filesToAppend.forEach((file) => formData.append('images', file));

      const res = await uploadGaragePost(formData);
      if (res?.success) {
        setText('');
        setImages([]);
        setOpen(false);
      } else {
        alert(res?.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload failed', err);
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
        <OrbButton variant={open ? 'active' : 'iconic'} onClick={() => setOpen(true)} title="Add Post (Alt + P)">
          <OrbIcons name="add" size={30} fill={open ? '#000' : '#fff'} />
        </OrbButton>
      </motion.div>

      <OrbModal isOpen={open} onClose={() => setOpen(false)}>
        <form
          className={styles.formcontainer}
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(e);
          }}
        >
          <div className={styles.body}>
            <div className={styles.writerRow} style={{ minHeight: '120px' }}>
              {/* EDIT MODE ONLY - no markdown preview */}
              <textarea
                className={styles.txtinput}
                placeholder="Share your story"
                value={text}
                ref={textareaRef}
                onChange={onTextChange}
                rows={Math.min(10, Math.max(3, currentLines))}
                disabled={uploading}
                aria-label="Post text"
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
              <div className={styles.progresscircle} aria-hidden title={`${charCount}/${MAX_CHARS}`}>
                <svg width="24" height="24">
                  <circle cx="12" cy="12" r={radius} stroke="hsla(0, 0%, 24%, 1.00)" strokeWidth="2" fill="none" />
                  <circle
                    cx="12" cy="12" r={radius}
                    stroke={progressColor} strokeWidth="2" fill="none"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    strokeLinecap="round" transform="rotate(-90 12 12)"
                    style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                  />
                </svg>
              </div>

              <OrbButton
                type="button"
                className={styles.uploadBtn}
                onClick={() => void handleSubmit()}
                disabled={!canSubmit}
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
