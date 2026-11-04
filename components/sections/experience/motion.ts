/**
 * Scroll entrances for one experience row. Call only from inside a useGSAP
 * callback (so every tween, ScrollTrigger and SplitText is reverted on
 * unmount) and only when reduced motion is off.
 *
 * Four groups, each with its own trigger, so a row reads well both on
 * desktop (all columns start level, groups cascade by their offsets) and on
 * phones (columns stack, each group plays as it scrolls in):
 *   A  hairline draws from the left → meta fades up → month strip builds
 *   B  company and role title rise out of line masks
 *   C  summary rises out of line masks
 *   D  points (with their markers) and stack chips stagger in
 */
import { EASE, SplitText, gsap } from "@/lib/gsap";

/**
 * Masked line split. aria "none" keeps the real text readable by screen
 * readers (the default "auto" moves it into an aria-label, which is ignored
 * on paragraphs). autoSplit re-splits on resize / font load; because each
 * onSplit returns its animation, SplitText carries the progress over.
 */
const SPLIT = {
  type: "lines",
  mask: "lines",
  linesClass: "split-line",
  aria: "none",
  autoSplit: true,
} as const;

export function animateExperienceRow(row: HTMLElement): void {
  const all = (selector: string) => Array.from(row.querySelectorAll<HTMLElement>(selector));
  const one = (selector: string) => row.querySelector<HTMLElement>(selector);

  // A — rule, meta column, month strip.
  gsap
    .timeline({ defaults: { ease: EASE.out }, scrollTrigger: { trigger: row, start: "top 85%", once: true } })
    .from(all("[data-exp-line]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.4, ease: EASE.inOut }, 0)
    .from(all("[data-exp-meta]"), { y: 18, opacity: 0, duration: 1, stagger: 0.07 }, 0.2)
    .from(
      all("[data-exp-cell]"),
      { scaleX: 0, transformOrigin: "0% 50%", duration: 0.7, stagger: 0.06, ease: EASE.inOut },
      0.55,
    );

  // B — company and role title.
  const head = all("[data-exp-company], [data-exp-role]");
  if (head.length) {
    SplitText.create(head, {
      ...SPLIT,
      onSplit: () =>
        gsap
          .timeline({
            defaults: { ease: EASE.out },
            scrollTrigger: { trigger: head[0], start: "top 88%", once: true },
          })
          .from(
            all("[data-exp-company] .split-line"),
            { yPercent: 115, rotate: 2.5, transformOrigin: "0% 0%", duration: 1.25, stagger: 0.09 },
            0.1,
          )
          .from(all("[data-exp-role] .split-line"), { yPercent: 115, duration: 1.1, stagger: 0.08 }, 0.32),
    });
  }

  // C — summary.
  const summary = one("[data-exp-summary]");
  if (summary) {
    SplitText.create(summary, {
      ...SPLIT,
      onSplit: (self) =>
        gsap
          .timeline({ scrollTrigger: { trigger: summary, start: "top 88%", once: true } })
          .from(self.lines, { yPercent: 115, duration: 1.1, stagger: 0.07, ease: EASE.out }, 0.22),
    });
  }

  // D — points and stack.
  const points = one("[data-exp-points]");
  if (points) {
    gsap
      .timeline({ defaults: { ease: EASE.out }, scrollTrigger: { trigger: points, start: "top 90%", once: true } })
      .from(all("[data-exp-point]"), { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0)
      .from(all("[data-exp-marker]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.9, stagger: 0.08 }, 0.18);
  }

  const stack = one("[data-exp-stack]");
  if (stack) {
    gsap.from(all("[data-exp-chip]"), {
      y: 14,
      opacity: 0,
      duration: 0.8,
      stagger: 0.035,
      ease: EASE.out,
      scrollTrigger: { trigger: stack, start: "top 92%", once: true },
    });
  }
}
