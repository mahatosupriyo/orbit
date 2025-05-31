import React from 'react';
import styles from './companynav.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/atoms/icons';

const CompanyNav = () => {
  const pathname = usePathname();

  return (
    <div className={styles.companynavwraper}>
      <div>
        <Link href="/" style={{ textDecoration: 'none', padding: '1rem' }}>
          <Icon name="oto" size={54} />
        </Link>
      </div>


      <div className={styles.companynav}>
        <Link
          className={`${styles.linkchip} ${pathname === '/company/terms' ? styles.active : ''
            }`}
          href="/company/terms"
        >
          Terms
        </Link>

        <Link
          className={`${styles.linkchip} ${pathname === '/company/delivery' ? styles.active : ''
            }`}
          href="/company/delivery"
        >
          shipping
        </Link>

        <Link
          className={`${styles.linkchip} ${pathname === '/company/cancellation' ? styles.active : ''
            }`}
          href="/company/cancellation"
        >
          refunds
        </Link>

        <Link
          className={`${styles.linkchip} ${pathname === '/company/privacy' ? styles.active : ''
            }`}
          href="/company/privacy"
        >
          privacy
        </Link>
      </div>
    </div>

  );
};

export default CompanyNav;
