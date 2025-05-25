"use client";
import styles from './navbar.module.scss';
import Icon from '@/components/atoms/icons';
import AvatarBtn from '@/components/atoms/avatarbtn/avatarbtn';
import Navigator from '@/app/(main)/navigator/navigator';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const slideDownVariant = {
    initial: { opacity: 0, y: -20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.785, 0.135, 0.15, 0.86],
        },
    },
};

export default function NavBar() {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <nav className={styles.navbarwraper}>
            <div className={styles.navbarcontainer}>
                {isHomePage ? (
                    <motion.div whileTap={{ scale: 0.96 }} variants={slideDownVariant} initial="initial" animate="animate">
                        <Link href="/">
                            <Icon name="oto" size={54} />
                        </Link>
                    </motion.div>
                ) : (
                    <Link href="/">
                        <Icon name="oto" size={54} />
                    </Link>
                )}

                {!isHomePage && <Navigator />}

                {isHomePage ? (
                    <motion.div variants={slideDownVariant} initial="initial" animate="animate">
                        <AvatarBtn avatarSrc="https://i.pinimg.com/736x/0f/83/6c/0f836caad77b9e5f67dd2eb071fc6ac2.jpg" />
                    </motion.div>
                ) : (
                    <AvatarBtn avatarSrc="https://i.pinimg.com/736x/0f/83/6c/0f836caad77b9e5f67dd2eb071fc6ac2.jpg" />
                )}
            </div>
        </nav>
    );
}
