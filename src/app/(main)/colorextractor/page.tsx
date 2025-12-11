"use client";

import OrbColorPalette from "@/components/ui/orbcomponent/orbcolorpalette/orbcolorpallete";
import OrbNavigator from "@/components/ui/orbcomponent/orbnav/orbnavigator";

export default function ColorExtractor() {

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            minHeight: '100dvh',
            justifyContent: 'space-between'
        }}>
            <OrbColorPalette />
            <OrbNavigator />
        </div>
    );
}
