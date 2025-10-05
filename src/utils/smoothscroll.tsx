"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4, // tweak for scroll feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // optional custom easing
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
