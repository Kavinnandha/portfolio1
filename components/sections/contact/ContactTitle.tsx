"use client";

import { useRef } from "react";
import { Emphasis } from "@/components/ui/SectionHeader";
import { EASE, SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import styles from "./Contact.module.css";

/**
 * The closing headline, one designed line per entry (`*em*` → serif italic).
 * Characters rise through per-line masks on first view.
 *
 * Accessibility: the heading's name comes from one plain-text copy; the
 * visual lines are aria-hidden, so the per-character split never reaches a
 * screen reader as letter soup.
 */
export default function ContactTitle({ lines, className }: { lines: readonly string[]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const plain = lines.join(" ").replace(/\*/g, "");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      SplitText.create(el.querySelectorAll("[data-line]"), {
        type: "lines,words,chars",
        mask: "lines",
        linesClass: "ct-line",
        aria: "none",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.chars, {
            yPercent: 125,
            rotate: 6,
            transformOrigin: "0% 100%",
            duration: 1.35,
            ease: EASE.out,
            stagger: 0.024,
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          });
        },
      });
    },
    { scope: ref },
  );

  return (
    <h2 ref={ref} className={cn("font-medium text-paper", styles.title, className)}>
      <span className="sr-only">{plain}</span>
      {lines.map((line, i) => (
        <span key={i} data-line aria-hidden className={cn("block", i === lines.length - 1 && i > 0 && "md:text-right")}>
          <Emphasis text={line} />
        </span>
      ))}
    </h2>
  );
}
