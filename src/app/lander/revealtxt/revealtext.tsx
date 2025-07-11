"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./revealtext.module.scss";

type AnimatedTextRevealProps = {
    text: string;
};

export default function AnimatedTextReveal({ text }: AnimatedTextRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "center center"],
    });

    const lines = text.split("\n");

    return (
        <div className={styles.container} ref={containerRef}>
            {lines.map((line, lineIndex) => {
                const words = line.trim().split(/\s+/);

                return (
                    <motion.p
                        key={lineIndex}
                        initial={{ opacity: 0, y: "2%", filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: false }}
                        className={styles.paragraph}
                    >
                        {words.map((word, wordIndex) => {
                            const i = lineIndex * 100 + wordIndex;
                            const wordProgress = useTransform(
                                scrollYProgress,
                                [i / 1000, (i + 1) / 1000],
                                [0.4, 1]
                            );
                            const wordOpacity = useTransform(wordProgress, [0.4, 1], [0.2, 1]);

                            return (
                                <motion.span
                                    key={wordIndex}
                                    className={styles.word}
                                    style={{ opacity: wordOpacity }}
                                >
                                    {word}&nbsp;
                                </motion.span>
                            );
                        })}
                    </motion.p>
                );
            })}
        </div>
    );
}
