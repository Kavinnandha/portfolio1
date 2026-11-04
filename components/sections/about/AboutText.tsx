"use client";

import { useRef } from "react";
import { about } from "@/lib/content";
import { EASE, SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const EDUCATION_LABEL = about.educationLabel;

/**
 * The about copy — a large lead paragraph, two supporting paragraphs and the
 * education record. Paragraph lines rise out of masks as they are reached;
 * the education rules draw across, then their rows settle in.
 */
export default function AboutText({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [lead, ...rest] = about.paragraphs;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>("[data-lines]", el).forEach((p) => {
        SplitText.create(p, {
          type: "lines",
          mask: "lines",
          tag: "span",
          // Lines only, words stay whole: screen readers read the text as-is.
          aria: "none",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.1,
              ease: EASE.out,
              stagger: 0.075,
              scrollTrigger: { trigger: p, start: "top 88%", once: true },
            });
          },
        });
      });

      const edu = el.querySelector<HTMLElement>("[data-edu]");
      if (edu) {
        gsap
          .timeline({ scrollTrigger: { trigger: edu, start: "top 88%", once: true } })
          .from(
            edu.querySelectorAll("[data-rule]"),
            { scaleX: 0, transformOrigin: "0% 50%", duration: 1.3, ease: EASE.inOut, stagger: 0.12 },
            0,
          )
          .from(
            edu.querySelectorAll("[data-edu-item]"),
            { opacity: 0, y: 18, duration: 0.9, ease: EASE.out, stagger: 0.06 },
            0.25,
          );
      }
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      <p
        data-lines
        className="text-[clamp(1.375rem,2.2vw,2.125rem)] leading-[1.24] tracking-[-0.022em] text-ink"
      >
        {lead}
      </p>

      {rest.length ? (
        <div className="mt-10 grid gap-x-10 gap-y-6 md:mt-14 md:grid-cols-2">
          {rest.map((text) => (
            <p key={text} data-lines className="text-[1.0625rem] leading-[1.65] text-ink-2 md:text-lg md:leading-[1.6]">
              {text}
            </p>
          ))}
        </div>
      ) : null}

      <div data-edu className="mt-16 md:mt-24">
        <h3 data-edu-item className="label text-muted">
          {EDUCATION_LABEL}
        </h3>
        <ol className="relative mt-5">
          {about.education.map((entry, i) => (
            <li
              key={entry.degree}
              className="relative grid grid-cols-1 gap-y-2 py-6 md:grid-cols-[9rem_minmax(0,1fr)_auto] md:gap-x-8 md:py-7"
            >
              {i === 0 ? (
                <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-line-strong" />
              ) : null}
              <span data-rule aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />
              <span data-edu-item className="font-mono text-[0.8125rem] text-muted md:pt-1.5">
                {entry.period}
              </span>
              <div data-edu-item>
                <p className="text-lg font-medium leading-snug tracking-[-0.015em] text-ink md:text-xl">{entry.degree}</p>
                <p className="mt-1.5 text-[0.95rem] leading-snug text-muted">{entry.school}</p>
              </div>
              <span data-edu-item className="font-mono text-[0.8125rem] text-ink tabular-nums md:pt-1.5 md:text-right">
                {entry.score}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
