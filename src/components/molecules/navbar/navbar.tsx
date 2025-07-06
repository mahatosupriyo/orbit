"use client";

import styles from './navbar.module.scss';
import AvatarBtn from '@/components/atoms/avatarbtn/avatarbtn';
import Navigator from '@/app/(main)/navigator/navigator';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

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

      <svg height="22" viewBox="0 0 138 51" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.9671 50.1055C14.593 50.1055 11.5352 49.3674 8.79376 47.8912C6.09448 46.3729 3.94349 44.243 2.34079 41.5015C0.780262 38.76 0 35.5968 0 32.0118C0 28.5534 0.759174 25.4534 2.27752 22.7119C3.83805 19.9705 5.98904 17.8195 8.7305 16.259C11.472 14.6984 14.5508 13.9182 17.9671 13.9182C21.2569 13.9182 24.2725 14.6563 27.0139 16.1324C29.7554 17.6086 31.9275 19.7174 33.5302 22.4589C35.1329 25.2004 35.9342 28.3847 35.9342 32.0118C35.9342 35.4703 35.154 38.5702 33.5934 41.3117C32.0751 44.0532 29.9452 46.2042 27.2037 47.7647C24.4623 49.3252 21.3834 50.1055 17.9671 50.1055ZM8.60397 32.0118C8.60397 34.922 9.4475 37.3471 11.1345 39.2872C12.8216 41.1852 15.0991 42.1341 17.9671 42.1341C20.8351 42.1341 23.1126 41.1852 24.7997 39.2872C26.4867 37.3471 27.3303 34.922 27.3303 32.0118C27.3303 29.1017 26.4867 26.6976 24.7997 24.7997C23.1126 22.8596 20.8351 21.8895 17.9671 21.8895C15.0991 21.8895 12.8216 22.8596 11.1345 24.7997C9.4475 26.6976 8.60397 29.1017 8.60397 32.0118Z" fill="white" />
        <path d="M39.9846 14.9304H48.5886V19.7385H48.8417C49.2212 18.2202 50.107 16.9549 51.4988 15.9427C52.9328 14.9304 54.8307 14.4243 57.1926 14.4243H61.8741V22.2691H57.1926C51.4566 22.2691 48.5886 25.3058 48.5886 31.3792V49.3463H39.9846V14.9304Z" fill="white" />
        <path d="M84.4457 50.1055C82.5478 50.1055 80.8186 49.8102 79.258 49.2198C77.6975 48.6293 76.1159 47.6592 74.5132 46.3096H74.2601V49.3463H65.6562V0H74.2601V18.2202H74.5132C75.5676 16.744 76.8751 15.6896 78.4356 15.0569C80.0383 14.3821 81.9151 14.0447 84.0661 14.0447C87.1872 14.0447 90.0341 14.7828 92.6068 16.259C95.2218 17.693 97.2884 19.7596 98.8068 22.4589C100.325 25.116 101.084 28.1738 101.084 31.6322C101.084 35.2594 100.346 38.4859 98.87 41.3117C97.3939 44.0953 95.3694 46.2674 92.7966 47.8279C90.2661 49.3463 87.4824 50.1055 84.4457 50.1055ZM73.754 32.0118C73.754 34.922 74.5976 37.3471 76.2846 39.2872C77.9717 41.1852 80.2492 42.1341 83.1172 42.1341C85.9852 42.1341 88.2627 41.1852 89.9497 39.2872C91.6368 37.3471 92.4803 34.922 92.4803 32.0118C92.4803 29.1017 91.6368 26.6976 89.9497 24.7997C88.2627 22.8596 85.9852 21.8895 83.1172 21.8895C80.2492 21.8895 77.9717 22.8596 76.2846 24.7997C74.5976 26.6976 73.754 29.1017 73.754 32.0118Z" fill="white" />
        <path d="M105.105 14.9304H113.709V49.3463H105.105V14.9304ZM104.346 7.08562C104.346 5.6938 104.831 4.51287 105.801 3.54281C106.813 2.53058 108.015 2.02446 109.407 2.02446C110.799 2.02446 111.98 2.53058 112.95 3.54281C113.962 4.51287 114.468 5.6938 114.468 7.08562C114.468 8.47744 113.962 9.67947 112.95 10.6917C111.98 11.6618 110.799 12.1468 109.407 12.1468C108.015 12.1468 106.813 11.6618 105.801 10.6917C104.831 9.67947 104.346 8.47744 104.346 7.08562Z" fill="white" />
        <path d="M127.63 49.3463C122.906 49.3463 120.545 46.9844 120.545 42.2607V21.2569H117.508V14.9304H120.545V6.07339H129.149V14.9304H138.006V21.2569H129.149V37.7056C129.149 39.0975 129.423 40.0886 129.971 40.6791C130.519 41.2274 131.384 41.5015 132.565 41.5015H138.006V49.3463H127.63Z" fill="white" />
      </svg>


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
