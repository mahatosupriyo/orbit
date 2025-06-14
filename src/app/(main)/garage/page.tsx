"use client";
import NavBar from '@/components/molecules/navbar/navbar';
import styles from './garage.module.scss';
import CapsuleCard from '@/components/molecules/capsules/capsule';
import { motion } from 'framer-motion';
import Overlay from '@/components/overlay/overlay';

const containerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.785, 0.135, 0.15, 0.86],
        },
    },
};

export default function GaragePage() {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <NavBar />

                <div className={styles.capsulegrid}>

                    <div className={styles.dropswraper}>

                        <motion.div
                            className={styles.drops}
                            variants={containerVariants}
                            initial="initial"
                            animate="animate"
                        >
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <p className={styles.tag}>Popular</p>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/ad/01/fd/ad01fde01183d57b43326404d946da5b.jpg" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <p className={styles.tag}>Latest</p>

                                <CapsuleCard imgSrc="https://i.pinimg.com/originals/13/1f/bb/131fbb06f6d1218cb8abb39fc01987ce.gif" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <p className={styles.tag}>Latest</p>

                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/26/75/b3/2675b3aae8f8f764a012dc6aea7992c9.jpg" />
                            </motion.div>
                        </motion.div>

                    </div>

                    <div className={styles.deengineering}>

                        <motion.div
                            className={styles.drops}
                            variants={containerVariants}
                            initial="initial"
                            whileInView="animate"
                        >
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/84/f8/4e/84f84e06db1465074526e65d949015dd.jpg" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/originals/91/c5/a4/91c5a48c3efb6bf0cb50784a143aa21a.gif" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/originals/db/8b/73/db8b737c8560d6b6df114d43eccb982e.gif" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/ad/01/fd/ad01fde01183d57b43326404d946da5b.jpg" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/originals/13/1f/bb/131fbb06f6d1218cb8abb39fc01987ce.gif" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/9f/e5/54/9fe5540569c9f0a0a16fd5453410fb7a.jpg" />
                            </motion.div>
                        </motion.div>

                    </div>
                </div>

                <div>
                    <Overlay
                        buttonText='Subscribe Pro'
                    >
                        this
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                    </Overlay>
                </div>


            </div>
        </div >
    );
}
