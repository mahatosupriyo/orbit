"use client";

import { motion, Variants } from 'framer-motion';
import React from 'react';
import styles from './accountnav.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/atoms/icons';
import type { IconProps } from '@/components/atoms/icons'; // ✅ import the type

const links: { href: string; label: string; icon: IconProps['name'] }[] = [
  { href: '/account', label: 'Account core', icon: 'settings' },
  { href: '/payment/history', label: 'Payments', icon: 'bill' },
  { href: '/company/privacy', label: 'Privacy radar', icon: 'lock' },
  { href: '/company/support', label: 'Support', icon: 'help' },
];

function AccountNav() {
  const pathname = usePathname();

  return (
    <div
      className={styles.accountnav}
    >
      {links.map(({ href, label, icon }) => {
        const isActive = pathname === href;

        return (
          <div className={styles.navbtn} key={href}>
            <Link
              draggable="false"
              href={href}
              className={`${styles.navlinkchip} ${isActive ? styles.active : ''}`}
            >
              <Icon name={icon} />
              {label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default AccountNav;
