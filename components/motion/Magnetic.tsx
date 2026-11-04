"use client";

import { useRef, type ReactNode } from "react";
import { gsap, hasFinePointer, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** 0–1: how far the element follows the pointer from its centre. */
  strength?: number;
};

/**
 * Pulls its child toward the pointer while hovered and springs back on
 * leave. Mouse/trackpad only; inert on touch and under reduced motion.
 */
export default function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !hasFinePointer()) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "elastic.out(1, 0.35)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "elastic.out(1, 0.35)" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        // Subtract the current offset so the centre is the resting centre.
        const cx = r.left + r.width / 2 - Number(gsap.getProperty(el, "x"));
        const cy = r.top + r.height / 2 - Number(gsap.getProperty(el, "y"));
        xTo((e.clientX - cx) * strength);
        yTo((e.clientY - cy) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
