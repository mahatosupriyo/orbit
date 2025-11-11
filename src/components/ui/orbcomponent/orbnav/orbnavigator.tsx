"use client"
import { usePathname } from "next/navigation";
import LnkOrbButton from "../../atomorb/buttonsorb/lnkbtnorb";
import OrbIcons from "../../atomorb/orbicons";
import OrbSearchComponent from "../orbsearch/orbsearch";
import { JSX } from "react";
import OrbAddPostModal from "../orbaddpost/orbaddpost";

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

    // Memoize the style object to prevent unnecessary re-renders
    const navStyle = {
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        // width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        top: '0',
        left: 0,
        // right: 0,
        gap: '0.2rem',
        padding: '1rem',
        zIndex: 99999,
    } as const;

    return (
        <nav style={navStyle} aria-label="Main navigation">
            <LnkOrbButton variant='iconic' href='/test' aria-label="Garage">
                <OrbIcons
                    fill={pathname === '/test' ? ACTIVE_FILL : DEFAULT_FILL}
                    name='garage'
                    size={ICON_SIZE}
                />
            </LnkOrbButton>

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