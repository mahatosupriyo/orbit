'use client';

import styles from "./capsule.module.scss";
import { motion } from "framer-motion";
import Icon from "@/components/atoms/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import { Scrollbar } from 'swiper/modules';
import "swiper/css";
import 'swiper/css/scrollbar';

interface CapsuleProps {
    imgSrcs: string[];
    alt?: string;
}

export default function CapsuleCard({ imgSrcs, alt = "Capsule Image" }: CapsuleProps) {
    return (
        <div className={styles.capsulewraper}>
            <motion.div className={styles.capsulebtn} draggable="false">
                <Swiper
                    scrollbar={{
                        hide: false,
                    }}
                    modules={[Scrollbar]}
                    loop={imgSrcs.length > 1}
                    className={styles.swiper}
                >
                    {imgSrcs.map((src, index) => (
                        <SwiperSlide key={index}>
                            <img
                                src={src}
                                alt={`${alt} ${index + 1}`}
                                draggable="false"
                                className={styles.capsulebanner}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </motion.div>

            <motion.button whileTap={{ scale: 0.9 }} className={styles.save}>
                <Icon name='save' size={28} />
            </motion.button>
        </div>
    );
}
