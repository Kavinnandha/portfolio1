"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A 2px accent hairline across the very top, scaled to page progress.
 * It maps scroll position directly (no easing of its own), so it stays on
 * under reduced motion — it is an indicator, not decoration.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bar = ref.current;
      if (!bar) return;
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          // refreshPriority -1: measure "max" after every pin spacer is in place.
          scrollTrigger: { start: 0, end: "max", scrub: true, refreshPriority: -1 },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-scroll-progress
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent will-change-transform"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
