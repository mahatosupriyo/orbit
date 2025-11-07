'use client';
import OrbButton from '@/components/ui/atomorb/buttonsorb/buttonorb';
import styles from './test.module.scss';
import LnkOrbButton from '@/components/ui/atomorb/buttonsorb/lnkbtnorb';
import OrbIcons from '@/components/ui/atomorb/orbicons';
import { usePathname } from "next/navigation";
import OrbSearchComponent from '@/components/ui/orbcomponent/orbsearch/orbsearch';
import OrbColorPalette from '@/components/ui/orbcomponent/orbcolorpalette/orbcolorpallete';
import OrbNavigator from '@/components/ui/orbcomponent/orbnav/orbnavigator';

export default function HomePage() {

  return (
    <div className={styles.wraper}>
      <div className={styles.colorpalettebox}>
        <OrbColorPalette />
      </div>
      <OrbNavigator/>
    </div>
  );
}
