"use client"
import { usePathname } from "next/navigation";
import LnkOrbButton from "../../atomorb/buttonsorb/lnkbtnorb";
import OrbIcons from "../../atomorb/orbicons";
import OrbSearchComponent from "../orbsearch/orbsearch";
import { JSX } from "react";
import OrbAddPostModal from "../orbaddpost/orbaddpost";
import styles from './orbnav.module.scss';
import WarnMobile from "../../atomorb/warnmobile/warnmobile";

/**
 * OrbNavigator Component
 * 
 * A fixed navigation bar component that appears at the bottom of the screen.
 * Provides navigation controls and search functionality for the application.
 * 
 * @returns {JSX.Element} The navigation bar component
 */
export default function OrbNavigator(): JSX.Element {
    // Get current pathname for active state management
    const pathname = usePathname();

    // Constants for styling
    const ACTIVE_FILL = '#252525';
    const DEFAULT_FILL = '#fff';
    const ICON_SIZE = 30;


    return (
        <nav className={styles.orbnav} aria-label="Main navigation">
            <LnkOrbButton variant='iconic' href='/test' aria-label="Garage">
                <OrbIcons
                    fill={pathname === '/test' ? ACTIVE_FILL : DEFAULT_FILL}
                    name='garage'
                    size={ICON_SIZE}
                />
            </LnkOrbButton>

            <WarnMobile/>

            <OrbSearchComponent />
            <OrbAddPostModal/>

            <LnkOrbButton variant='iconic' href='/colorextractor' aria-label="Color settings">
                <OrbIcons
                    fill={pathname === '/colorextractor' ? ACTIVE_FILL : DEFAULT_FILL}
                    name='color'
                    size={ICON_SIZE}
                />
            </LnkOrbButton>
        </nav>
    );
}