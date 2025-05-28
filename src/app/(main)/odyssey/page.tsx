"use client";
import React from 'react';
import NavBar from '@/components/molecules/navbar/navbar';
import styles from './odyssey.module.scss';
import Video from 'next-video';
import { motion } from 'framer-motion';
import VideoChip from '@/components/atoms/videochip/videochip';

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

export default function OdysseyPage() {

    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <NavBar />
                <div className={styles.playerwraper}>

                    <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={containerVariants}
                        className={styles.playercontainer}>
                        <motion.div variants={itemVariants} className={styles.playersection}>
                            <motion.div style={{ width: '100%', overflow: 'hidden' }}>
                                <Video className={styles.playercomp} style={{ width: '100%', userSelect: 'none', pointerEvents: 'none', height: '100%' }}
                                    playbackId='I00sgVOUCVQLklE5mtWQF4vsuumi00ZODzfMEjzVeOL900'
                                    poster="https://image.mux.com/I00sgVOUCVQLklE5mtWQF4vsuumi00ZODzfMEjzVeOL900/thumbnail.webp"
                                />
                            </motion.div>


                            <div className={styles.videolabel}>

                                <div className={styles.videoinfo}>
                                    <p className={styles.eplabel}>Episode I</p>
                                    <h2 className={styles.title}>
                                        Visual composition and technique library
                                    </h2>
                                </div>


                            </div>
                        </motion.div>

                        <motion.div className={styles.videochipwraper}
                            variants={containerVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <motion.h1 variants={itemVariants} className={styles.wraperheader}>Made for you</motion.h1>

                            <motion.div variants={itemVariants}>

                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/48/2b/22/482b22ce795d2868d307a82d69d74082.jpg'
                                    label='Episode I'
                                    title='Introduction - Breaking the Ice'
                                />

                            </motion.div>

                            <motion.div variants={itemVariants}>

                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/73/4e/e1/734ee14b886e273d70442a7dcddc48e9.jpg'
                                    label='Episode II'
                                    premium={true}
                                    title='You Can Do It | Out of Home | D&AD Awards 2024 Shortlist'
                                />

                            </motion.div>

                            <motion.div variants={itemVariants}>


                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/f9/56/43/f9564358e9b356d8bed014e5dfb4500e.jpg'
                                    label='Episode III'
                                    title='Jush! - Edgar Bąk'
                                    premium={true}
                                />

                            </motion.div>

                            <motion.div variants={itemVariants}>


                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/e1/39/33/e13933e2c75456f1145fb8d8aa53476e.jpg'
                                    label='Episode IV'
                                    title='Nico Edge Port'
                                />

                            </motion.div>


                            <motion.div variants={itemVariants}>


                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/23/e9/e0/23e9e06f6ece42b27afe5d40d107aea3.jpg'
                                    label='Episode V'
                                    title='Nico Edge Port'
                                />

                            </motion.div>

                            <motion.div variants={itemVariants}>


                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/f6/e9/0a/f6e90ab1507281ea6dee5bcfef5a6559.jpg'
                                    label='Episode VI'
                                    title='Nico Edge Port'
                                />

                            </motion.div>

                        </motion.div>
                    </motion.div>


                </div>
            </div>
        </div >
    );
}