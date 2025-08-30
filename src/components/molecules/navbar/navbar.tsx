"use client";

import styles from './navbar.module.scss';
import AvatarBtn from '@/components/atoms/avatarbtn/avatarbtn';
import Navigator from '@/app/(main)/navigator/navigator';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import Icon from '@/components/atoms/icons';

// Routes where stagger animation should be applied
const STAGGER_ROUTES = ['/'];

// Checks if current path requires staggered animation
const isStaggeredRoute = (pathname: string): boolean => STAGGER_ROUTES.includes(pathname);

// Slide-down animation for individual items
const slideDownVariant: Variants = {
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

// Parent variant for stagger effect
const parentStaggerVariant: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function NavBar() {

  const pathname = usePathname();
  const useStagger = isStaggeredRoute(pathname);

  const Logo = (
    <Link href="/">


      <Icon name='oto' size={24} fill="#fff"/>
    </Link>
  );

  const NavItems = useStagger ? (
    <motion.div
      className={styles.navitems}
      variants={parentStaggerVariant}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'row', gap: '1.6rem' }}
    >

      <motion.div variants={slideDownVariant}>
        <Navigator />
      </motion.div>

      <motion.div variants={slideDownVariant}>
        <AvatarBtn />
      </motion.div>
    </motion.div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '1.6rem' }}>
      <Navigator />
      <AvatarBtn />
    </div>
  );

  return (
    <nav className={styles.navbarwraper}>
      <div className={styles.navbarcontainer}>
        {Logo}
        {NavItems}
      </div>
    </nav>
  );
}
