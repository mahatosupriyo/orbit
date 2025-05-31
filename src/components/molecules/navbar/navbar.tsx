"use client";
import styles from './navbar.module.scss';
import Icon from '@/components/atoms/icons';
import AvatarBtn from '@/components/atoms/avatarbtn/avatarbtn';
import Navigator from '@/app/(main)/navigator/navigator';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Animation variant for sliding down elements with fade-in.
 */
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

/**
 * NavBar component
 * - Shows the logo, navigation, and avatar button.
 * - Animates logo and avatar on the homepage.
 * - Displays the Navigator only on non-home pages.
 */
export default function NavBar() {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <nav className={styles.navbarwraper}>
            <div className={styles.navbarcontainer}>
                {/* Logo: animated on homepage, static otherwise */}
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

                {/* Show navigation only on non-home pages */}
                {!isHomePage && <Navigator />}

                {/* Avatar button: animated on homepage, static otherwise */}
                {isHomePage ? (
                    <motion.div variants={slideDownVariant} initial="initial" animate="animate">
                        <AvatarBtn />
                    </motion.div>
                ) : (
                    <AvatarBtn />
                )}
            </div>
        </nav>
    );
}