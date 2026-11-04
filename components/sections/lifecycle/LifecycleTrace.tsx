"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import FlowTrace from "./FlowTrace";
import StageTrace from "./StageTrace";
import { flowTrace, pinnedTrace } from "./motion";

/**
 * Hosts both renderings of the request trace and picks one per viewport:
 * the pinned stage on large, tall screens with motion allowed; the flowing
 * timeline everywhere else (and, untouched, under reduced motion / no JS).
 * The choice is the `data-lc-mode` attribute, set from GSAP so it reverts
 * with the media query.
 */
export default function LifecycleTrace() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px) and (min-height: 700px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduce } = context.conditions ?? {};
          if (reduce) return;
          return desktop ? pinnedTrace(root) : flowTrace(root);
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} data-lc-mode="flow" className="group/lc relative">
      <FlowTrace />
      <StageTrace />
    </div>
  );
}
