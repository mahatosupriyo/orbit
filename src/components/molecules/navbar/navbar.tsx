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

      <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 394 244" fill="none">
        <path d="M29.6942 39.5742H9.88002V35.6222H5.92801V31.6702H1.976V7.90402H5.92801V3.95201H9.88002V0H29.6942V3.95201H33.6462V7.90402H37.5982V31.6702H33.6462V35.6222H29.6942V39.5742ZM13.832 31.6702H25.7151V27.7182H29.6942V11.856H25.7151V7.90402H13.832V11.856H9.88002V27.7182H13.832V31.6702Z" fill="white" />
        <path d="M51.1888 39.5742H43.2848V0H51.1888V3.95201H55.1408V0H68.9999V3.95201H72.979V7.90402H76.931V39.5742H68.9999V11.856H65.0479V7.90402H55.1408V11.856H51.1888V39.5742Z" fill="white" />
        <path d="M21.7631 100.124H9.88002V96.1722H5.92801V66.478H0V60.55H5.92801V48.6669H13.8591V60.55H21.7631V66.478H13.8591V92.2202H21.7631V100.124Z" fill="white" />
        <path d="M33.4318 100.124H25.5278V44.6878H33.4318V64.502H37.3838V60.55H51.2429V64.502H55.222V68.454H59.174V100.124H51.2429V72.406H47.2909V68.454H37.3838V72.406H33.4318V100.124Z" fill="white" />
        <path d="M92.6059 100.124H72.7917V96.1722H68.8397V92.2202H64.8877V68.454H68.8397V64.502H72.7917V60.55H92.6059V64.502H96.5579V68.454H100.51V82.3131H72.7917V88.2682H76.7437V92.2202H88.6268V88.2682H100.51V92.2202H96.5579V96.1722H92.6059V100.124ZM72.7917 76.3851H92.6059V72.406H88.6268V68.454H76.7437V72.406H72.7917V76.3851Z" fill="white" />
        <path d="M78.4821 243.344H23.5983V232.397H12.6515V221.45H1.70477V155.62H12.6515V144.673H23.5983V133.726H78.4821V144.673H89.4289V155.62H100.376V221.45H89.4289V232.397H78.4821V243.344ZM34.5451 221.45H67.4604V210.504H78.4821V166.566H67.4604V155.62H34.5451V166.566H23.5983V210.504H34.5451V221.45Z" fill="white" />
        <path d="M138.021 243.344H116.127V133.726H138.021V144.673H148.967V133.726H176.409V155.62H148.967V166.566H138.021V243.344Z" fill="white" />
        <path d="M208.656 243.344H186.762V89.7891H208.656V144.673H219.603V133.726H263.54V144.673H274.486V155.62H285.433V221.45H274.486V232.397H263.54V243.344H219.603V232.397H208.656V243.344ZM219.603 221.45H252.518V210.504H263.54V166.566H252.518V155.62H219.603V166.566H208.656V210.504H219.603V221.45Z" fill="white" />
        <path d="M323.078 117.231H301.185V95.3375H323.078V117.231ZM323.078 243.344H301.185V133.726H323.078V243.344Z" fill="white" />
        <path d="M393.638 243.344H360.723V232.397H349.776V150.146H333.356V133.726H349.776V100.811H371.745V133.726H393.638V150.146H371.745V221.45H393.638V243.344Z" fill="white" />
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
