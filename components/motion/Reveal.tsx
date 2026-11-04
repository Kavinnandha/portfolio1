"use client";

import { useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Distance travelled upward, in px. */
  y?: number;
  delay?: number;
  duration?: number;
  /** Stagger between `[data-reveal]` children, when any exist. */
  stagger?: number;
  /** ScrollTrigger start, e.g. "top 85%". */
  start?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

/**
 * Fades and lifts content in the first time it scrolls into view.
 * Mark children with `data-reveal` to stagger them individually; otherwise
 * the wrapper animates as one block. Uses opacity (not visibility) so hidden
 * content stays focusable — tabbing to it scrolls it in and reveals it.
 */
export default function Reveal({
  as: Tag = "div",
  children,
  className,
  y = 48,
  delay = 0,
  duration = 1.2,
  stagger = 0.08,
  start = "top 88%",
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
      const targets = items.length ? Array.from(items) : [el];
      gsap.from(targets, {
        y,
        opacity: 0,
        duration,
        delay,
        stagger,
        ease: EASE.out,
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
