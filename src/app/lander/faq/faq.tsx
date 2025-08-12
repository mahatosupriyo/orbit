"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./faq.module.scss"; // optional SCSS styling

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: Record<string, FAQItem[]> = {
    "Getting started": [
        {
            question: "How does it work?",
            answer:
                "On the Orbit is your AI-powered learning platform for designers. Access curated lessons, personalized tools, and community interaction – all tailored to your creative journey."
        },
        {
            question: "How do I sign up?",
            answer:
                "Simply create an account, choose your subscription plan, and you’re ready to start learning. You can access your dashboard instantly."
        }
    ],
    Subscription: [
        {
            question: "What subscription plans do you offer?",
            answer:
                "We offer flexible plans including monthly, yearly, and lifetime options. Each plan unlocks premium AI tools, lessons, and community perks."
        },
        {
            question: "Can I cancel anytime?",
            answer:
                "Yes, you can cancel your subscription anytime from your account settings without any hidden fees."
        }
    ],
    Features: [
        {
            question: "What makes On the Orbit different?",
            answer:
                "We blend AI-driven personalization with expert-led design education, helping you learn what you want, how you want."
        },
        {
            question: "Do you provide support beyond lessons?",
            answer:
                "Yes! Get access to AI-powered guidance, design critiques, and community feedback 24/7."
        }
    ]
};

export default function FAQSection() {
    const [activeTab, setActiveTab] = useState<keyof typeof faqData>("Getting started");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={styles.faqContainer}>
            {/* Tab Selectors */}
            <div className={styles.tabSelector}>
                {Object.keys(faqData).map((tab) => (
                    <motion.button
                    whileTap={{scale: 0.96}}
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ""
                            }`}
                        onClick={() => {
                            setActiveTab(tab as keyof typeof faqData);
                            setOpenIndex(null);
                        }}
                    >
                        {(activeTab === tab) && <span style={{ display: 'flex', borderRadius: '4rem', height: '0.6rem', width: '0.6rem', background: '#fff' }}></span>}
                        {tab}
                    </motion.button>
                ))}
            </div>

            {/* FAQ List */}
            <div className={styles.faqList}>
                {faqData[activeTab].map((item, index) => (
                    <div key={index} className={styles.faqItem}>
                        <button
                            className={styles.faqQuestion}
                            onClick={() => toggleFAQ(index)}
                        >
                            <span>{item.question}</span>
                            <motion.span
                                animate={{ rotate: openIndex === index ? 45 : 0 }}
                                transition={{ duration: 0.1, ease: "easeInOut" }}
                                className={styles.icon}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 27 27" fill="none">
                                    <path d="M0 13.5H27M13.5 27V0" strokeWidth="1.6" stroke="#000" />
                                </svg>
                            </motion.span>
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    className={styles.faqAnswer}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.1, ease: "easeInOut" }}
                                >
                                    <p>{item.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
