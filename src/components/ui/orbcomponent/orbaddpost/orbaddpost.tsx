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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_IMAGES = 5;
  const MAX_CHARS = 200;
  const MAX_LINES = 10;

  useEffect(() => {
    if (open && textareaRef.current) textareaRef.current.focus();
  }, [open]);

  // keyboard shortcuts: Alt/Cmd+P to open, ESC to close
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

  // paste images from clipboard when modal open
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
        } else if (it.type && it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) toRead.push(f);
        }
      }

      if (toRead.length === 0) return;

      e.preventDefault(); // avoid pasting binary into textarea

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

  function cryptoRandomId() {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).slice(2, 9);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
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

  // reorder handlers
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
  const onDoubleClickThumb = (id: string) => removeImage(id);

  // textarea change: enforce max chars & lines; keep internal whitespace; collapse 3+ newlines -> 2
  function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    let val = e.target.value;
    val = val.replace(/\r\n/g, '\n');
    if (val.length > MAX_CHARS) val = val.slice(0, MAX_CHARS);
    const lines = val.split('\n');
    if (lines.length > MAX_LINES) val = lines.slice(0, MAX_LINES).join('\n');
    val = val.replace(/\n{3,}/g, '\n\n');
    setText(val);
  }

  // convert dataURL -> File (visible to user; keep best-effort)
  async function dataUrlToFile(dataUrl: string, filename = 'image.png') {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
  }

  /**
   * wrapDomains
   * - Wraps URLs/domains in #^#...#^# markers so server can detect links.
   * - Intentionally preserves the entire matched string (including path and query).
   * - Avoids double-wrapping if already wrapped.
   */
  function wrapDomains(input: string) {
    if (!input) return input;

    // This pattern aims to match urls with optional path/query. It will not swallow trailing whitespace.
    const urlPattern =
      /(?:https?:\/\/[^\s#]+|www\.[^\s#]+|[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}(?:\/[^\s#]*)?)/gi;

    return input.replace(urlPattern, (match, offset, full) => {
      const start = typeof offset === 'number' ? offset : full.indexOf(match);
      const end = start + match.length;
      const before = full.lastIndexOf('#^#', start - 1);
      const after = full.indexOf('#^#', end);

      // if already inside markers, don't wrap
      if (before !== -1 && after !== -1 && before < start && after > end) {
        return match;
      }
      return `#^#${match}#^#`;
    });
  }

  // FRONTEND validation: do not allow image-only posts (images require non-empty title/text)
  const canSubmit =
    !uploading &&
    // must have some text to post
    text.trim().length > 0 &&
    // images cap respected implicitly
    images.length <= MAX_IMAGES;

  // submit handler
  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (uploading) return;

    // block image-only posts: require title/text when images exist
    if (images.length > 0 && text.trim().length === 0) {
      try {
        alert('A title/text is required when uploading images.');
      } catch {}
      return;
    }

    // block entirely empty submissions
    if (text.trim().length === 0 && images.length === 0) return;

    setUploading(true);

    try {
      // keep internal content intact; normalize line endings and collapse >2 newlines
      let finalText = text.replace(/\r\n/g, '\n');
      finalText = finalText.replace(/\n{3,}/g, '\n\n').replace(/\n{2,}/g, '\n\n');

      // remove only leading/trailing blank lines, but DO NOT remove content characters
      finalText = finalText.replace(/^\s*\n+/, '').replace(/\n+\s*$/, '');

      // IMPORTANT: avoid aggressively trimming characters that could be part of URL path
      // but trim surrounding whitespace
      finalText = finalText.trim();

      // wrap domains/urls for server processing
      const wrapped = wrapDomains(finalText);

      const formData = new FormData();
      // server expects title and caption — use wrapped text for both
      // If wrapped is empty (text-only not provided), guard earlier so this won't be reached
      formData.append('title', wrapped || '');
      formData.append('caption', wrapped || '');

      // convert images to File if needed and append
      const filesToAppend: File[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.file) {
          filesToAppend.push(img.file);
        } else if (img.src && typeof img.src === 'string' && img.src.startsWith('data:')) {
          // eslint-disable-next-line no-await-in-loop
          const file = await dataUrlToFile(img.src, `pasted-${i}.png`);
          filesToAppend.push(file);
        } else if (img.src && typeof img.src === 'string') {
          // attempt best-effort fetch if it's a remote url (may fail due to CORS)
          try {
            // eslint-disable-next-line no-await-in-loop
            const file = await dataUrlToFile(img.src, `img-${i}.png`);
            filesToAppend.push(file);
          } catch {
            // skip this image if we can't fetch it
          }
        }
      }

      filesToAppend.forEach((file) => formData.append('images', file));

      const res = await uploadGaragePost(formData);

      if (res?.success) {
        setText('');
        setImages([]);
        setOpen(false);
        try {
          alert('Post uploaded successfully');
        } catch {}
      } else {
        try {
          alert(res?.message || 'Upload failed');
        } catch {}
      }
    } catch (err: any) {
      console.error('Upload failed', err);
      try {
        alert(err?.message || 'Upload failed unexpectedly');
      } catch {}
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
            <div className={styles.writerRow}>
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
              <div className={styles.progresscircle} aria-hidden>
                <svg width="20" height="20">
                  <circle cx="10" cy="10" r={8} stroke="hsla(0, 0%, 24%, 1.00)" strokeWidth="1.2" fill="none" />
                  <circle cx="10" cy="10" r={8} stroke="#3b82f6" strokeWidth="1.2" fill="none" strokeDasharray={2 * Math.PI * 8} transform="rotate(-90 10 10)" />
                </svg>
              </div>

              <OrbButton
                type="button"
                className={styles.uploadBtn}
                onClick={() => void handleSubmit()}
                // IMPORTANT: disable when uploading OR text empty OR (images exist but no text)
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
