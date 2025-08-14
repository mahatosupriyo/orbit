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

      <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 287 109" fill="none">
        <path d="M39.7893 46.6392C33.7626 46.6392 28.64 48.7485 24.4213 52.9672C20.2026 57.1858 18.0933 62.3085 18.0933 68.3352C18.0933 74.2614 20.2026 79.3338 24.4213 83.5525C26.4302 85.6618 28.7404 87.2689 31.352 88.3738C34.064 89.3783 36.8764 89.8805 39.7893 89.8805C42.7022 89.8805 45.4644 89.3783 48.076 88.3738C50.6875 87.2689 53.048 85.6618 55.1573 83.5525C59.376 79.3338 61.4853 74.2614 61.4853 68.3352C61.4853 62.3085 59.376 57.1858 55.1573 52.9672C50.7377 48.7485 45.6151 46.6392 39.7893 46.6392ZM39.7893 28.5592C45.3137 28.5592 50.4866 29.6138 55.308 31.7232C60.1293 33.732 64.348 36.5445 67.964 40.1605C71.58 43.7765 74.3924 47.9952 76.4013 52.8165C78.5106 57.6378 79.5653 62.8107 79.5653 68.3352C79.5653 73.7592 78.5106 78.8818 76.4013 83.7032C74.3924 88.5245 71.58 92.7432 67.964 96.3592C64.348 99.9752 60.1293 102.838 55.308 104.947C50.4866 106.956 45.3137 107.96 39.7893 107.96C34.2649 107.96 29.092 106.956 24.2706 104.947C19.4493 102.838 15.2306 99.9752 11.6146 96.3592C7.99864 92.7432 5.13597 88.5245 3.02664 83.7032C1.01775 78.8818 0.0133057 73.7592 0.0133057 68.3352C0.0133057 62.8107 1.01775 57.6378 3.02664 52.8165C5.13597 47.9952 7.99864 43.7765 11.6146 40.1605C15.2306 36.5445 19.4493 33.732 24.2706 31.7232C29.092 29.6138 34.2649 28.5592 39.7893 28.5592Z" fill="white" />
        <path d="M104.479 36.3938C107.292 34.0836 110.456 32.1752 113.971 30.6685C117.587 29.1618 121.655 28.4085 126.175 28.4085V46.4885C120.149 46.4885 115.026 48.5978 110.807 52.8165C106.589 57.236 104.479 62.3587 104.479 68.1845V106.002H86.3994V30.5178H104.479V36.3938Z" fill="white" />
        <path d="M174.289 28.7098C179.813 28.7098 184.886 29.7645 189.506 31.8738C194.227 33.8827 198.295 36.6952 201.71 40.3112C205.125 43.9272 207.787 48.1458 209.695 52.9672C211.604 57.7885 212.558 62.9614 212.558 68.4858C212.558 73.9098 211.604 79.0325 209.695 83.8538C207.787 88.6752 205.125 92.8938 201.71 96.5098C198.295 100.126 194.227 102.988 189.506 105.098C184.886 107.107 179.813 108.111 174.289 108.111C168.362 108.111 162.989 106.956 158.167 104.646L164.646 88.5245C167.057 89.5289 169.769 90.0312 172.782 90.0312C178.909 90.0312 184.032 87.9218 188.15 83.7032C192.369 79.4845 194.478 74.412 194.478 68.4858C194.478 62.4592 192.369 57.3365 188.15 53.1178C183.931 48.8992 178.809 46.7898 172.782 46.7898C166.956 46.7898 161.834 48.8992 157.414 53.1178C153.195 57.3365 151.086 62.4592 151.086 68.4858V106.152H133.006V0.535156H151.086V36.6952C153.999 34.3849 157.364 32.4765 161.181 30.9698C164.998 29.4632 169.367 28.7098 174.289 28.7098Z" fill="white" />
        <path d="M219.339 106.002V30.6685H237.419V106.002H219.339ZM219.339 0.535156H237.419V18.6152H219.339V0.535156Z" fill="white" />
        <path d="M286.3 106.002H269.727C266.312 106.002 263.097 105.349 260.084 104.043C257.071 102.737 254.459 100.98 252.249 98.7698C250.04 96.4596 248.282 93.7978 246.976 90.7845C245.67 87.7712 245.017 84.5569 245.017 81.1418V15.4512L263.097 10.9312V39.7085H273.644L278.164 57.7885H263.097V81.1418C263.097 83.0503 263.75 84.6574 265.056 85.9632C266.362 87.2689 267.919 87.9218 269.727 87.9218H281.78L286.3 106.002Z" fill="white" />
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
