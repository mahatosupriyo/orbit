"use client";

import React from "react";
import { easeInOut, motion } from "framer-motion";
import OrbIcons from '../../atomorb/orbicons';
import styles from "./orbpost.module.scss";
import Link from "next/link";
import ImageLightbox from "../orbimagebox/orbimagelightbox";
import NumberFlow from "@number-flow/react";

export interface OrbPostProps {
    username: string;
    avatarUrl?: string;
    content: string;
    href?: string;
    images?: { id: string | number; src: string; alt?: string }[];
    likes?: number;
    isLiked?: boolean;
    onLike?: () => void;
    postedAt?: string;
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
 * Show the full link including path, but strip protocol + leading www. for display.
 */
function prettyUrl(raw: string) {
    try {
        return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    } catch {
        return raw;
    }
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



/**
 * Convert a block of text into React nodes:
 * - Split on double-newline => paragraphs
 * - Inside paragraph: detect url matches and render anchors
 * - Convert single newline to <br/>
 */
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

        // create fresh regex instance per paragraph to avoid lastIndex leaks
        const regex = new RegExp((urlRegex as RegExp).source, (urlRegex as RegExp).flags);
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
                        color: '#1B90D6',
                        fontWeight: 500,
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

export default function OrbPost({
    username,
    avatarUrl = FALLBACK_AVATAR,
    content,
    postedAt,
    href = "/",
    images = [],
    likes = 0,
    isLiked = false,
    onLike,
}: OrbPostProps) {
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
                        <div>
                            <Link draggable={false} href={href} className={styles.username}>
                                {username}
                                <OrbIcons name="verified" size={10} />
                            </Link>
                        </div>

                        <div className={styles.poststory}>{renderedContent}</div>

                        {images.length > 0 && (
                            <div className={styles.postImages}>
                                <ImageLightbox images={images} className={styles.postImagePreview} />
                            </div>
                        )}

                        <div className={styles.usercontrols}>
                            <div className={styles.likecontrol}>

                                <motion.button
                                    whileTap={{ scale: 0.98, opacity: 0.6, outline: "0.3rem solid #f918801f" }}
                                    className={`${styles.likebtn} ${isLiked ? styles.liked : ""}`}
                                    aria-pressed={isLiked}
                                    onClick={onLike}
                                    type="button"
                                    transition={{ duration: 0.1, ease: easeInOut, type: "spring", stiffness: 400, damping: 10 }}
                                    aria-label={isLiked ? "Unlike" : "Like"}
                                >

                                    <svg
                                        className={styles.hearticon}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 91 80" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M44.151 79.3089C36.2565 74.4534 18.381 63.8709 8.06504 48.0389C-1.22796 33.7769 -1.67326 21.1439 2.60804 12.4299C6.00254 5.51969 12.4244 0.945891 20.014 0.128891C28.2249 -0.750019 37.576 2.81639 45.209 12.3559C52.8418 2.82069 62.193 -0.749109 70.404 0.128891C77.9978 0.945301 84.42 5.51949 87.81 12.4299C92.0873 21.1447 91.6459 33.7779 82.353 48.0349C72.029 63.8789 54.123 74.4799 46.24 79.3239C45.576 79.7341 44.7673 79.6989 44.1502 79.3083L44.151 79.3089Z" />
                                    </svg>

                                </motion.button>

                                {likes > 0 && (
                                    <span className={styles.liketext}>
                                        <NumberFlow value={likes} />
                                    </span>
                                )}
                            </div>

                            <span className={styles.postedtime}>
                                {postedAt ?? "Posted now"}
                            </span>

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
