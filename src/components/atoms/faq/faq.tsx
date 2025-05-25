"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./faq.module.scss";

interface FAQProps {
  faqs: { question: string; answer: string }[];
}

/**
 * FAQ Component
 * @param {FAQProps} props - The props for the FAQ component.
 * @returns {JSX.Element} The FAQ component.
 */
export default function FAQ({ faqs }: FAQProps) {
  return (
    <div className={styles.faqContainer}>
      <h2 className={styles.title}>
        Your questions, answered
      </h2>
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

/**
 * FAQItem Component
 * @param {FAQItemProps} props - The props for the FAQItem component.
 * @returns {JSX.Element} The FAQItem component.
 */
const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem}>
      <motion.button
        whileTap={{ opacity: 0.6 }}
        className={`${styles.question} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={styles.icon}
        >
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={styles.answer}
          >
            <div className={styles.answerContent}>{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};