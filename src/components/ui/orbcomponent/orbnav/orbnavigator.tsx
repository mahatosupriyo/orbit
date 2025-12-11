"use client"
import { usePathname } from "next/navigation";
import LnkOrbButton from "../../atomorb/buttonsorb/lnkbtnorb";
import OrbIcons from "../../atomorb/orbicons";
import OrbSearchComponent from "../orbsearch/orbsearch";
import { JSX } from "react";
import OrbAddPostModal from "../orbaddpost/orbaddpost";
import styles from './orbnav.module.scss';
// import WarnMobile from "../../atomorb/warnmobile/warnmobile";

/**
 * OrbNavigator Component
 * 
 * A fixed navigation bar component that provides the primary navigation interface
 * for the application, displayed at the bottom of the screen on desktop and mobile.
 * 
 * Features:
 * - Dynamic active state indication based on current route
 * - Search functionality for content discovery
 * - Post creation modal trigger
 * - Mobile-specific warnings
 * - Semantic HTML with ARIA labels for accessibility
 * 
 * @component
 * @returns {JSX.Element} The rendered navigation bar with interactive controls
 * 
 * @example
 * ```tsx
 * <OrbNavigator />
 * ```
 */
export default function OrbNavigator(): JSX.Element {
    // Get current pathname for active state management
    const pathname = usePathname();

    // Visual constants for icon styling
    const ACTIVE_FILL = '#252525';
    const DEFAULT_FILL = '#fff';
    const ICON_SIZE = 30;

    return (
        <nav className={styles.orbnav} aria-label="Main navigation">
            {/* Garage/Home navigation button */}
            <LnkOrbButton variant='iconic' href='/test' aria-label="Garage">
                <OrbIcons
                    fill={pathname === '/test' ? ACTIVE_FILL : DEFAULT_FILL}
                    name='garage'
                    size={ICON_SIZE}
                />
            </LnkOrbButton>

            {/* Mobile-specific warning component */}
            {/* <WarnMobile /> */}

            {/* Search bar component */}
            <OrbSearchComponent />

            {/* Add post modal trigger */}
            <OrbAddPostModal />

            {/* Color settings/preferences navigation button */}
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