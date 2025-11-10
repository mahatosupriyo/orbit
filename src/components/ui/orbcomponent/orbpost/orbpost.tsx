"use client";

import React from "react";
import { motion } from "framer-motion";
import OrbIcons from '../../atomorb/orbicons';
import styles from "./orbpost.module.scss";
import Link from "next/link";
import ImageLightbox from "../orbimagebox/orbimagelightbox";

export interface OrbPostProps {
    username: string;
    avatarUrl?: string;
    content: string;
    href?: string;
    images?: { id: string | number; src: string; alt?: string }[];
    likes?: number;
    isLiked?: boolean;
    onLike?: () => void;
}

const FALLBACK_AVATAR = "https://ontheorbit.com/placeholder.png";

/**
 * URL detection regex (robust-but-not-perfect).
 * Matches:
 *  - https://example.com/...
 *  - http://example.com/...
 *  - www.example.com/...
 *  - domain.com or sub.domain.co/path
 *
 * This intentionally excludes emails and won't match strings with spaces.
 */
const urlRegex =
    /((https?:\/\/[^\s<>]+)|(www\.[^\s<>]+)|([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}(?:\/[^\s<>]*)?))/ig;

/**
 * Convert a block of text into React nodes:
 * - Split on double-newline => paragraphs
 * - Inside paragraph: detect url matches and render anchors
 * - Convert single newline to <br/>
 */

function prettyUrl(raw: string) {
    try {
        const clean = raw.replace(/^https?:\/\//, "").replace(/^www\./, "");
        const parts = clean.split("/");
        if (parts.length <= 1) return clean; // just domain
        return `${parts[0]}/…`; // domain + ellipsis
    } catch {
        return raw;
    }
}


function renderContent(text: string): React.ReactNode {
    if (!text) return null;

    // Normalize CRLF to LF
    const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // ✅ Remove #^#link#^# markers from server-side formatting
    const cleaned = normalized.replace(/#\^#(.*?)#\^#/g, "$1");

    // Split into paragraphs where there are double line breaks
    const paragraphs = cleaned.split(/\n{2}/);

    return paragraphs.map((para, pIndex) => {
        const nodes: React.ReactNode[] = [];
        let lastIndex = 0;
        let matchIndex = 0;

        const regex = new RegExp(urlRegex);
        let m: RegExpExecArray | null;
        while ((m = regex.exec(para)) !== null) {
            const match = m[0];
            const start = m.index;

            if (start > lastIndex) {
                pushTextWithBreaks(nodes, para.substring(lastIndex, start), `t-${pIndex}-${matchIndex}-before`);
            }

            const href = makeHref(match);
            nodes.push(
                <a
                    key={`link-${pIndex}-${matchIndex}`}
                    href={href}
                    style={{
                        textDecoration: 'none',
                        color: '#1B90D6'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.inlineLink}
                >
                    {prettyUrl(match)}
                </a>
            );

            lastIndex = start + match.length;
            matchIndex++;
        }

        if (lastIndex < para.length) {
            pushTextWithBreaks(nodes, para.substring(lastIndex), `t-${pIndex}-last`);
        }

        return (
            <p key={`para-${pIndex}`} className={styles.postParagraph}>
                {nodes}
            </p>
        );
    });
}


/** Helper: push text but convert single newlines to <br/> nodes */
function pushTextWithBreaks(
    nodes: React.ReactNode[],
    text: string,
    keyPrefix: string
) {
    // Split on single newline
    const pieces = text.split("\n");
    pieces.forEach((piece, idx) => {
        // push text piece
        nodes.push(<React.Fragment key={`${keyPrefix}-${idx}`}>{piece}</React.Fragment>);
        // if not last piece, push a <br/>
        if (idx < pieces.length - 1) {
            nodes.push(<br key={`${keyPrefix}-br-${idx}`} />);
        }
    });
}

/** Normalize matched text to a safe href (prepend https:// when needed) */
function makeHref(raw: string) {
    // If starts with http(s) already, use as-is
    if (/^https?:\/\//i.test(raw)) return raw;
    // If starts with www. add https://
    if (/^www\./i.test(raw)) return `https://${raw}`;
    // Otherwise treat as domain or path => prefix https://
    return `https://${raw}`;
}



export default function OrbPost({
    username,
    avatarUrl = FALLBACK_AVATAR,
    content,
    href = "/",
    images = [],
    likes = 0,
    isLiked = false,
    onLike,
}: OrbPostProps) {
    const heartClass = isLiked ? `${styles.hearticon} ${styles.liked}` : styles.hearticon;

    const renderedContent = renderContent(content);

    return (
        <article className={styles.orbpost} aria-label={`Post by ${username}`}>
            <div className={styles.orbpostwraper}>
                <div className={styles.layer}>
                    <img
                        draggable={false}
                        src={avatarUrl || FALLBACK_AVATAR}
                        alt={`${username} avatar`}
                        className={styles.avatar}
                    />

                    <div className={styles.postcontent}>
                        <Link draggable={false} href={href} className={styles.username}>
                            {username}
                            <OrbIcons name="verified" size={10} />
                        </Link>

                        <div className={styles.poststory}>{renderedContent}</div>

                        {/* Image preview + lightbox */}
                        {images.length > 0 && (
                            <div className={styles.postImages}>
                                {/* previewSize can be a number (px) or string like "100%" */}
                                <ImageLightbox images={images} className={styles.postImagePreview} />
                            </div>
                        )}


                        <div className={styles.usercontrols}>
                            <motion.button
                                whileTap={{ scale: 0.98, opacity: 0.6 }}
                                className={styles.likebtn}
                                aria-pressed={isLiked}
                                onClick={onLike}
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 9" fill="none" className={heartClass} aria-hidden>
                                    <path d="M2.69336 0.500977C2.98464 0.500434 3.27336 0.557254 3.54199 0.669922C3.81044 0.782554 4.05319 0.948232 4.25684 1.15625H4.25781L4.99805 1.91016L4.99902 1.90918L5.73828 1.15723C5.94204 0.948922 6.18537 0.783572 6.4541 0.670898C6.72253 0.558356 7.011 0.501439 7.30176 0.501953H7.30273L7.30469 0.500977L7.30371 0.501953C7.59509 0.501388 7.88366 0.558141 8.15234 0.670898C8.3544 0.755745 8.54266 0.870473 8.70996 1.01074L8.87012 1.15918L8.87109 1.16016C9.27041 1.57131 9.49322 2.12215 9.49316 2.69531C9.4931 3.26857 9.26965 3.81937 8.87012 4.23047L8.86816 4.23242L5.68066 7.47656L5.68164 7.47754C5.59257 7.56898 5.48586 7.64196 5.36816 7.69141C5.25083 7.74065 5.12475 7.76482 4.99805 7.76465L4.99902 7.76562H4.99609V7.76465C4.8697 7.76461 4.74451 7.74029 4.62793 7.69141C4.51065 7.64217 4.40434 7.56944 4.31543 7.47852L1.12695 4.23438L1.125 4.2334C0.724212 3.82201 0.5 3.26966 0.5 2.69531C0.500065 2.12108 0.724301 1.56953 1.125 1.1582H1.12598C1.33003 0.949264 1.57346 0.782899 1.84277 0.669922C2.11141 0.557271 2.40013 0.500423 2.69141 0.500977V0.5H2.69434L2.69336 0.500977Z" />
                                </svg>
                                <span className={styles.liketext}>{likes}</span>
                            </motion.button>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98, opacity: 0.6 }}
                        className={styles.moreicon}
                        aria-label="More options"
                        type="button"
                    >
                        more
                    </motion.button>
                </div>
            </div>
        </article>
    );
}
