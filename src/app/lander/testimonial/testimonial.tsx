// components/TestimonialSlider.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./testimonial.module.scss";

const testimonials = [
    {
        name: "Ayush Singh",
        role: "Cofounder at SecondBrainLabs",
        quote: "The future of design learning doesn’t look like school. It looks like this.",
        avatar: "https://ik.imagekit.io/ontheorbit/Essentials/testimonial/ayush.jpg?updatedAt=1754227940336",
    },
    {
        name: "Srijanika Dey",
        role: "COO At OnTheOrbit",
        quote: "We built what we needed when we were lost.",
        avatar: "https://ik.imagekit.io/ontheorbit/Essentials/testimonial/srija.png?updatedAt=1754230512798",
    },
    {
        name: "Anushka Saha",
        role: "Designer",
        quote: "I was a beta learner, Colleges teach you rules, Orbit teaches you taste. That’s what we need in the Post AI Era.",
        avatar: "https://ik.imagekit.io/ontheorbit/Essentials/testimonial/anushka.png?updatedAt=1754230845261",
    },
    {
        name: "Subhra Kabiraj",
        role: "Aspiring Developer",
        quote: "Orbit made me see design as a story, not just a project.",
        avatar: "https://ik.imagekit.io/ontheorbit/Essentials/testimonial/subhro.png?updatedAt=1754231026154",
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
