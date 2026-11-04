/**
 * One place that registers GSAP plugins, so every client component imports
 * from here instead of from "gsap" directly. Import only from client
 * components ("use client").
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.config({ nullTargetWarn: false });
  // Mobile address-bar show/hide resizes the viewport; refreshing every time
  // makes pinned sections jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** House easings. Entrances use `out`; things that travel use `inOut`. */
export const EASE = {
  out: "expo.out",
  outSoft: "power3.out",
  inOut: "power4.inOut",
  in: "power3.in",
} as const;

/** Durations in seconds, so pacing stays consistent across sections. */
export const DUR = {
  fast: 0.5,
  base: 0.9,
  slow: 1.3,
} as const;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** True for mouse/trackpad users. Hover-only effects should check this. */
export function hasFinePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}
