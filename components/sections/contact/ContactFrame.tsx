"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import styles from "./Contact.module.css";

/**
 * The dark finale's shell. As it scrolls in, the ink panel opens from an
 * inset, round-shouldered card to full bleed — scrubbed, so the hand-off from
 * the paper page follows the reader. It is fully open long before its bottom
 * edge (where the Footer continues in ink) can reach the viewport.
 */
export default function ContactFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { clipPath: "inset(0% 3.5% 0% 3.5% round 2rem 2rem 0rem 0rem)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0rem 0rem 0rem 0rem)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "top 50%", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="contact" data-theme="dark" className={cn("relative bg-ink text-paper", styles.root)}>
      {children}
    </section>
  );
}
