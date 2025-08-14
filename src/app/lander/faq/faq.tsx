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
            question: "How do I sign up?",
            answer:
                "Simply create an account, choose your subscription plan, and you’re ready to start learning. You can access your dashboard instantly."
        },
        {
            question: "Who is Orbit for?",
            answer:
                "If you’re a designer, creative, or just someone who knows they have ideas but don’t know how to bring them to life — Orbit’s for you. Beginners, switchers, dreamers, all welcome."
        },
        {
            question: "Do I need to know design before joining?",
            answer:
                "Nope. You just need curiosity, a laptop, and the patience to learn. We’ll handle the tools, the guidance, and the kick in the right direction."
        },
        {
            question: "How do I start?",
            answer:
                "Sign up on ontheorbit.com, choose your plan, and boom — you’re in. You’ll get access to Garage, Odyssey, and all your tools right away."
        },
        {
            question: "Can I build my own brand here?",
            answer:
                "Yes. We’ll even give you a free .com domain so you can make it happen from day one."
        },
        {
            question: "Do I get to talk to mentors directly?",
            answer:
                "Yes. Orbit isn’t some faceless “course platform.” Our mentors are real humans who’ve done the work — and they’re here to guide you."
        }
    ],
    Subscription: [
        {
            question: "What subscription plans do you offer?",
            answer:
                "We offer flexible plans including quarterly and yearly options. Each plan unlocks premium AI tools, lessons, and community perks."
        },
        {
            question: "Can I cancel anytime?",
            answer:
                "Yes, you can cancel your subscription anytime from your account settings without any hidden fees."
        },
        {
            question: "What’s included in my subscription?",
            answer:
                "Everything you actually need: Adobe Creative Cloud, Garage, Odyssey, onsite workshops, and a 1-year .com domain."
        },
        {
            question: "Will I keep my .com domain after the year?",
            answer:
                "Yes, you can renew it yourself after the free year ends."
        },
        {
            question: "Can I upgrade my subscription later?",
            answer:
                "Absolutely. You can start small and go bigger when you’re ready."
        },
        {
            question: "Is there a refund policy?",
            answer:
                "Yes, we have one which is within 1 month — but only if you genuinely haven’t used the platform. We’re building for committed learners, not dabblers."
        }
    ],
    Features: [
        {
            question: "What is Garage?",
            answer:
                "Your self-learning playground. Font pairing guides, design inspiration, visual effects, tips — everything you need to tinker and explore."
        },
        {
            question: "What is Odyssey?",
            answer:
                "Your guided adventure. Exclusive episodes, handpicked mentors, and structured lessons designed to make you industry-ready."
        },
        {
            question: "Do I get Adobe Creative Cloud?",
            answer:
                "Yes, from day one. Photoshop, Illustrator, Premiere Pro, After Effects — all yours."
        },
        {
            question: "What are onsite workshops?",
            answer:
                "We take you into the real world. Work on local brands, see how ideas become campaigns, and get your hands dirty with live projects."
        },
        {
            question: "How will I build my portfolio here?",
            answer:
                "Every project you do in Orbit is practical, relevant, and industry-ready. By the end, you’ll have work you’re proud to show off."
        },
        {
            question: "Can I get feedback on my work?",
            answer:
                "Yes, from mentors and peers. No more guessing if your design is “good enough.”"
        },
        {
            question: "What’s the deal with the free .com domain?",
            answer:
                "We give it so you can start building your online presence right now — whether it’s your portfolio, personal blog, or your first brand site."
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
                        whileTap={{ scale: 0.96 }}
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => {
                            setActiveTab(tab as keyof typeof faqData);
                            setOpenIndex(null);
                        }}
                    >
                        {activeTab === tab && (
                            <span style={{ display: 'flex', borderRadius: '4rem', height: '0.6rem', width: '0.6rem', background: '#fff' }}></span>
                        )}
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
