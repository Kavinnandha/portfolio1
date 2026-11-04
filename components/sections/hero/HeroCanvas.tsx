"use client";

import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/gsap";
import { afterPreloader } from "./afterPreloader";
import { createFlowField } from "./flowField";

/**
 * Static stand-in for the shader: shown with JS off, without WebGL, after a
 * context loss, and underneath the canvas while it cross-fades in. Echoes the
 * field's resting composition (wash + core upper right, paper-2 cloud upper
 * left, plain paper along the bottom edge).
 */
const FALLBACK = [
  "radial-gradient(22% 30% at 72% 36%, rgb(187 192 255 / 0.8), rgb(187 192 255 / 0) 100%)",
  "radial-gradient(48% 62% at 70% 38%, rgb(226 230 255 / 0.92), rgb(226 230 255 / 0) 100%)",
  "radial-gradient(42% 50% at 18% 30%, rgb(235 232 225 / 0.85), rgb(235 232 225 / 0) 100%)",
].join(", ");

/** Hero background: WebGL flow field over a CSS gradient fallback. Decorative. */
export default function HeroCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let destroy: (() => void) | null = null;
    // Init only once the preloader lifts, so shader work never competes with it.
    const cancel = afterPreloader(() => {
      destroy = createFlowField(host, { still: prefersReducedMotion(), interactive: hasFinePointer() });
    });
    return () => {
      cancel();
      destroy?.();
      destroy = null;
    };
  }, []);

  return (
    <div
      ref={ref}
      data-hero-bg
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-paper"
      style={{ backgroundImage: FALLBACK }}
    />
  );
}
