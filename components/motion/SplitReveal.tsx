"use client";

import { useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { EASE, SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type SplitRevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** What rises out of the line masks. */
  type?: "lines" | "words" | "chars";
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

/**
 * Headline reveal: text is split into masked lines (and words/chars when
 * asked) that rise into place the first time the element scrolls into view.
 * Nested inline elements such as <em> survive the split. SplitText re-splits
 * on resize and font load (autoSplit), keeping line breaks correct.
 */
export default function SplitReveal({
  as: Tag = "h2",
  children,
  className,
  type = "lines",
  delay = 0,
  duration = 1.25,
  stagger,
  start = "top 86%",
  ...rest
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      // aria "auto" moves the text into an aria-label and hides the pieces.
      // Headings can carry a label; paragraphs and spans cannot, so screen
      // readers would get nothing there — leave their text in place instead.
      const isHeading = /^H[1-6]$/.test(el.tagName);

      SplitText.create(el, {
        type: type === "chars" ? "lines,words,chars" : type === "words" ? "lines,words" : "lines",
        aria: isHeading ? "auto" : "none",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
          return gsap.from(targets, {
            yPercent: 115,
            rotate: type === "lines" ? 2.5 : 0,
            transformOrigin: "0% 0%",
            duration,
            delay,
            stagger: stagger ?? (type === "chars" ? 0.018 : type === "words" ? 0.035 : 0.09),
            ease: EASE.out,
            scrollTrigger: { trigger: el, start, once: true },
          });
        },
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
