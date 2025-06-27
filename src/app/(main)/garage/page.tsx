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

                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/41/1f/2f/411f2fb882f9874cb0e70b167051eec4.jpg" />
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
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/38/31/e2/3831e2a32e580356c31ad53f26a47798.jpg" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/f0/6b/78/f06b783837ca63a5f2addc0215411fbd.jpg" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/originals/db/8b/73/db8b737c8560d6b6df114d43eccb982e.gif" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/26/a1/34/26a134850ebc1bd500ea4be53fc028ac.jpg" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/19/11/4f/19114fe0cc2a5084cdb81a2d84dbf673.jpg" />
                            </motion.div>
                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/d8/a5/03/d8a50370b4af0bed43dc8adea98daa08.jpg" />
                            </motion.div>

                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/18/c5/b0/18c5b03225f9fd623cedfdcc59d2f5ac.jpg" />
                            </motion.div>

                            <motion.div className={styles.dropcard} variants={itemVariants}>
                                <CapsuleCard imgSrc="https://i.pinimg.com/736x/18/c5/b0/18c5b03225f9fd623cedfdcc59d2f5ac.jpg" />
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
