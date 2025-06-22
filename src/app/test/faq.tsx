'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './faq.module.scss';

const faqData = [
  {
    question: 'Is Orbit for beginners or professionals?',
    answer: 'Both. Whether you’re just starting or switching careers, we’ll meet you where you are and push your skills further.',
  },
  {
    question: 'What do I actually learn at Orbit?',
    answer: 'You’ll dive into real-world projects across UI/UX, branding, motion, and product design — and build a portfolio that speaks.',
  },
  {
    question: 'Do I need fancy tools or a MacBook?',
    answer: 'Nope. We give you access to essential tools and teach you to design with whatever setup you have.',
  },
  {
    question: 'Is certification included?',
    answer: 'Yes — but our real goal is to help you build industry-ready work that gets you noticed, not just a certificate.',
  },
  {
    question: 'How is Orbit different from a bootcamp?',
    answer: 'Bootcamps teach frameworks. We build your creative taste, instincts, and real execution — like working in a real studio.',
  },
  {
    question: 'Will Orbit help me get a design job?',
    answer: 'Yes. We help you build a portfolio that speaks louder than a résumé, and we connect you to real opportunities.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className={styles.faq}>
      {faqData.map((item, index) => (
        <div key={index} className={styles.row}>
          <div className={styles.number}>{index + 1}</div>

          <div className={styles.qa}>
            <button className={styles.question} onClick={() => toggle(index)}>
              {item.question}
            </button>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  className={styles.answer}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  {item.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </section>
  );
}
