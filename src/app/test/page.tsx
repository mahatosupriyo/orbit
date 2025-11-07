'use client';
import OrbNavigator from '@/components/ui/orbcomponent/orbnav/orbnavigator';
import styles from './test.module.scss';
import OrbPost from '@/components/ui/orbcomponent/orbpost/orbpost';

export default function HomePage() {

  return (
    <div className={styles.wraper}>
      <OrbPost />
      <OrbNavigator />
    </div>
  );
}
