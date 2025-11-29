"use client";
import React, { JSX } from "react";
import { urlRegex, prettyUrl, makeHref } from "@/utils/urls";
import styles from "./orbpost.module.scss";

/**
 * Splits text by newlines and pushes fragments with <br/> elements between them.
 * @param nodes - Array to accumulate React nodes
 * @param text - Text to split and process
 * @param keyPrefix - Prefix for generating unique React keys
 */
function pushTextWithBreaks(nodes: React.ReactNode[], text: string, keyPrefix: string): void {
    const pieces = text.split("\n");
    pieces.forEach((piece, idx) => {
        nodes.push(
            <React.Fragment key={`${keyPrefix}-${idx}`}>
                {piece}
            </React.Fragment>
        );
        if (idx < pieces.length - 1) {
            nodes.push(<br key={`${keyPrefix}-br-${idx}`} />);
        }
    });
}

/**
 * Renders content with URL detection and formatting.
 * Processes text to identify URLs, converts them to clickable links,
 * and preserves paragraph and line break structure.
 *
 * @param content - The raw content string to render
 * @returns JSX element with formatted content, or null if content is empty
 */
export default function ContentRenderer({ content }: { content: string }): JSX.Element | null {
    if (!content) return null;

    // Normalize line endings to \n for consistent processing
    const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Remove custom markers (e.g., #^#text#^#)
    const cleaned = normalized.replace(/#\^#(.*?)#\^#/g, "$1");

    // Split into paragraphs by double newlines
    const paragraphs = cleaned.split(/\n{2}/);

    return (
        <>
            {paragraphs.map((para, pIndex) => {
                const nodes: React.ReactNode[] = [];
                let lastIndex = 0;
                let matchIndex = 0;

                // Create regex instance for URL matching
                const regex = new RegExp(
                    (urlRegex as RegExp).source,
                    (urlRegex as RegExp).flags
                );

                // Iterate through all URL matches in paragraph
                let m: RegExpExecArray | null;
                while ((m = regex.exec(para)) !== null) {
                    const match = m[0];
                    const start = m.index;

                    // Add text before URL
                    if (start > lastIndex) {
                        pushTextWithBreaks(
                            nodes,
                            para.substring(lastIndex, start),
                            `t-${pIndex}-${matchIndex}-before`
                        );
                    }

                    // Add link element
                    const href = makeHref(match);
                    nodes.push(
                        <a
                            key={`link-${pIndex}-${matchIndex}`}
                            href={href}
                            style={{
                                textDecoration: "none",
                                color: "#1B90D6",
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

                // Add remaining text after last URL
                if (lastIndex < para.length) {
                    pushTextWithBreaks(
                        nodes,
                        para.substring(lastIndex),
                        `t-${pIndex}-last`
                    );
                }

                return (
                    <p key={`para-${pIndex}`} className={styles.postParagraph}>
                        {nodes}
                    </p>
                );
            })}
        </>
    );
}
