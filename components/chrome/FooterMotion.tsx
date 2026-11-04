"use client";

import { useRef, type ReactNode } from "react";
import { EASE, ScrollTrigger, SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Client shell for the (server-rendered) footer:
 * - fits the full-bleed wordmark to the exact width, whatever the font metrics;
 * - `[data-footer-rise]` content is uncovered from beneath the hairline
 *   (scrubbed parallax) as the footer scrolls in;
 * - the wordmark's characters rise in when it enters the viewport.
 */
export default function FooterMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const footer = ref.current;
      if (!footer) return;
      const box = footer.querySelector<HTMLElement>("[data-footer-mark-box]");
      const mark = footer.querySelector<HTMLElement>("[data-footer-mark]");
      const rise = footer.querySelector<HTMLElement>("[data-footer-rise]");
      const motion = !prefersReducedMotion();
      let alive = true;

      // Split before fitting: per-character boxes lose kerning, so measure the split text.
      const split =
        motion && mark ? SplitText.create(mark, { type: "chars", tag: "span", aria: "none" }) : null;

      let lastWidth = 0;
      /** Returns true when the font size actually changed. */
      const fit = (force = false): boolean => {
        if (!box || !mark) return false;
        const avail = box.clientWidth;
        if (!avail || (!force && avail === lastWidth)) return false;
        lastWidth = avail;
        const before = mark.style.fontSize;
        mark.style.fontSize = "";
        const natural = mark.getBoundingClientRect().width;
        if (!natural) {
          mark.style.fontSize = before;
          return false;
        }
        const base = parseFloat(getComputedStyle(mark).fontSize);
        const next = `${((base * avail) / natural).toFixed(2)}px`;
        mark.style.fontSize = next;
        return Math.abs(parseFloat(next) - (parseFloat(before) || base)) > 0.5;
      };

      const refreshLater = () => requestAnimationFrame(() => alive && ScrollTrigger.refresh());
      // If the page had already finished loading, ScrollTrigger's load-time refresh
      // measured the pre-fit height — refresh once more.
      if (fit() && document.readyState === "complete") refreshLater();
      void document.fonts?.ready.then(() => {
        if (alive && fit(true)) refreshLater();
      });

      let frame = 0;
      const onResize = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => fit());
      };
      window.addEventListener("resize", onResize);

      if (motion && rise) {
        gsap.fromTo(
          rise,
          { yPercent: -32 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: true },
          },
        );
      }

      if (split && mark) {
        gsap.from(split.chars, {
          yPercent: 120,
          duration: 1.4,
          ease: EASE.out,
          stagger: 0.045,
          scrollTrigger: { trigger: mark, start: "top 92%", once: true },
        });
      }

      return () => {
        alive = false;
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} data-theme="dark" className={className}>
      {children}
    </footer>
  );
}
