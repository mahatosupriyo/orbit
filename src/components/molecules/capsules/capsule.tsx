import Link from "next/link";
import styles from "./capsule.module.scss";
import { motion } from "framer-motion";
import Icon from "@/components/atoms/icons";

interface CapsuleProps {
    imgSrc: string;
    alt?: string;
}

export default function CapsuleCard({ imgSrc, alt = "Capsule Image" }: CapsuleProps) {
    return (
        <div className={styles.capsulewraper}>
            <motion.div draggable="false" className={styles.capsulebtn}>
                <img
                    src={imgSrc}
                    alt={alt}
                    draggable="false"
                    className={styles.capsulebanner}
                />


            </motion.div>

            <motion.button whileTap={{ scale: 0.9 }} className={styles.save}>
                <Icon name='save' size={28} />
            </motion.button>
        </div>
    );
}