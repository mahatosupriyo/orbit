"use client";

import React from 'react';
import styles from './accountnav.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/atoms/icons';
import type { IconProps } from '@/components/atoms/icons'; // Import IconProps type for type safety

// Define navigation links with their respective href, label, and icon name
const links: { href: string; label: string; icon: IconProps['name'] }[] = [
  { href: '/account', label: 'Account core', icon: 'settings' },
  { href: '/payment/history', label: 'Payments', icon: 'bill' },
  { href: '/goodbye', label: 'Data privacy', icon: 'lock' },
  // Uncomment and add more links as needed
  // { href: '/company/privacy', label: 'Privacy radar', icon: 'lock' },
  // { href: '/company/support', label: 'Support', icon: 'help' },
];

/**
 * AccountNav component renders the account navigation sidebar.
 * Highlights the active link based on the current pathname.
 */
function AccountNav() {
  const pathname = usePathname(); // Get current route path

  return (
    <div className={styles.accountnav}>
      {links.map(({ href, label, icon }) => {
        // Determine if the current link is active
        const isActive = pathname === href;

        return (
          <div className={styles.navbtn} key={href}>
            <Link
              draggable="false"
              href={href}
              className={`${styles.navlinkchip} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined} // Accessibility: indicate current page
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
