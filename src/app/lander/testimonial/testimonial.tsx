// components/TestimonialSlider.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./testimonial.module.scss";

const testimonials = [
    {
        name: "Darshan Raval",
        role: "PRO member",
        quote: "Every part of Orbit makes you feel like a creator, not a student.",
        avatar: "https://lastfm.freetls.fastly.net/i/u/ar0/f1df7c3eb64df572d647ba70e5dfa795.jpg",
    },
    {
        name: "Alicia Dsouza",
        role: "Creator",
        quote: "Orbit turned my curiosity into a creative habit.",
        avatar: "https://svgames.me/jpg/ab6761610000e5ebe1e00861cdb6bf56b14a1118-1.jpg",
    },
    {
        name: "Ravi Narayan",
        role: "Designer",
        quote: "I finally found a space that respects beginners with ambition.",
        avatar: "https://book-my-singer.s3.ap-south-1.amazonaws.com/website-assets/artist/Darshan+Raval/Book+Darshan+Raval+from+Book+My+Singer.webp",
    },
    {
        name: "Luna Park",
        role: "Freelancer",
        quote: "No boring lectures—just real-world creation.",
        avatar: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR-M795oQ-_jnzRyrmxDZpzQUglKIAW1WkhiP3JuAx24sSajIZyP1gjBOR2-bghlac4BRfJUvIwoClCXjzCKBQyWw",
    },
];

export default function Testimonial() {
    const [index, setIndex] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        const blinkTimeout = setTimeout(() => setIsBlinking(true), 9000);
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % testimonials.length);
            setIsBlinking(false);
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(blinkTimeout);
        };
    }, [index]);

    return (
        <div className={styles.testimonialGrid}>
            <div className={styles.left}>

                <div className={styles.avatarGroup}>
                    {testimonials.map((t, i) => {
                        const isActive = i === index;
                        return (
                            <motion.button
                                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`${styles.avatarWrapper} ${isActive ? styles.active : styles.inactive
                                    } ${isActive && isBlinking ? styles.blink : ""}`}
                            >
                                <img src={t.avatar} alt={t.name} className={styles.avatar} />
                            </motion.button>
                        );
                    })}
                </div>
            </div>
            <div className={styles.right}>
                <AnimatePresence mode="wait">
                    <motion.blockquote
                        key={index}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className={styles.quote}
                    >
                        “{testimonials[index].quote}”
                        <footer className={styles.quotefooter}>
                            <motion.h3
                                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                className={styles.name}>{testimonials[index].name}</motion.h3>
                            <motion.span
                                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                className={styles.designation}>{testimonials[index].role}</motion.span>
                        </footer>
                    </motion.blockquote>
                </AnimatePresence>
            </div>
        </div>
    );
}
