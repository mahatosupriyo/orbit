'use client';
import OrbButton from '@/components/ui/atomorb/buttonsorb/buttonorb';
import styles from './test.module.scss';
import LnkOrbButton from '@/components/ui/atomorb/buttonsorb/lnkbtnorb';
import OrbIcons from '@/components/ui/atomorb/orbicons';
import { usePathname } from "next/navigation";
import OrbSearchComponent from '@/components/ui/orbcomponent/orbsearch/orbsearch';
import OrbColorPalette from '@/components/ui/orbcomponent/orbcolorpalette/orbcolorpallete';

export default function HomePage() {
  const pathname = usePathname();
  const activeFill = '#252525';
  const defaultFill = '#fff';
  const iconsize = 30

  return (
    <div className={styles.wraper}>
      <div className={styles.colorpalettebox}>
        <OrbColorPalette />
      </div>
      <div
        style={{
          display: 'flex',
          position: 'fixed',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          bottom: '0',
          left: 0,
          right: 0,
          gap: '0.4rem',
          padding: '1rem'
        }}
      >
        <LnkOrbButton variant='iconic' href='/test'>
          <OrbIcons
            fill={pathname === '/test' ? activeFill : defaultFill}
            name='garage'
            size={iconsize}
          />
        </LnkOrbButton>

        <OrbSearchComponent />


        <LnkOrbButton variant='iconic' href='/add'>
          <OrbIcons
            fill={pathname === '/add' ? activeFill : defaultFill}
            name='add'
            size={iconsize}
          />
        </LnkOrbButton>

        <LnkOrbButton variant='iconic' href='/'>
          <OrbIcons
            fill={pathname === '/' ? activeFill : defaultFill}
            name='color'
            size={iconsize}
          />
        </LnkOrbButton>
      </div>
    </div>
  );
}
