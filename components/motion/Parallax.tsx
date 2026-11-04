"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Travel as a percentage of the element's own height, each way. */
  amount?: number;
};

/** Drifts its content vertically, scrubbed against the scroll. */
export default function Parallax({ children, className, amount = 10 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const inner = el?.firstElementChild;
      if (!el || !inner || prefersReducedMotion()) return;
      // Oversize the content just enough that the drift never exposes an edge.
      const scale = 1 + (amount * 2.4) / 100;
      gsap.fromTo(
        inner,
        { yPercent: -amount, scale },
        {
          yPercent: amount,
          scale,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div className="will-change-transform">{children}</div>
    </div>
  );
}
