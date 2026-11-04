/**
 * Scroll entrances for the Recognition section. Call only from inside a
 * useGSAP callback (so everything is reverted on unmount) and only when
 * reduced motion is off. Initial states are set here, never in CSS.
 */
import { EASE, ScrollTrigger, SplitText, gsap } from "@/lib/gsap";

/**
 * Builds one paused timeline per item, then plays them through
 * ScrollTrigger.batch so items that arrive together (a fast scroll, an
 * anchor jump, a tall screen) cascade instead of popping in at once. The
 * batch callback only restarts timelines made here, so it creates nothing
 * that could outlive the useGSAP context.
 */
function batchReveal(
  items: HTMLElement[],
  build: (item: HTMLElement) => gsap.core.Timeline,
  { start = "top 90%", step = 0.1 }: { start?: string; step?: number } = {},
): void {
  if (!items.length) return;
  const timelines = new Map<Element, gsap.core.Timeline>();
  items.forEach((item) => timelines.set(item, build(item).pause()));
  ScrollTrigger.batch(items, {
    start,
    once: true,
    onEnter: (batch) => batch.forEach((item, i) => timelines.get(item)?.delay(i * step).restart(true)),
  });
}

export function animateRecognition(root: HTMLElement): void {
  const all = (selector: string, scope: ParentNode = root) =>
    Array.from(scope.querySelectorAll<HTMLElement>(selector));

  // Small mono openers and stand-alone links (the publication's opener is
  // part of its own timeline below, so it lands after its rule draws).
  all("[data-rec-fade]").forEach((el) => {
    if (el.closest("[data-pub]")) return;
    gsap.from(el, {
      y: 16,
      opacity: 0,
      duration: 1,
      ease: EASE.out,
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });

  // Block rules that close or open a group.
  all("[data-award-end], [data-cert-line]").forEach((el) => {
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: "0% 50%",
      duration: 1.4,
      ease: EASE.inOut,
      scrollTrigger: { trigger: el, start: "top 95%", once: true },
    });
  });

  // Awards: each row draws its hairline, then its cells rise in turn.
  batchReveal(
    all("[data-award-row]"),
    (row) =>
      gsap
        .timeline({ defaults: { ease: EASE.out } })
        .from(all("[data-award-line]", row), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.3, ease: EASE.inOut }, 0)
        .from(all("[data-award-cell]", row), { y: 28, opacity: 0, duration: 1.1, stagger: 0.07 }, 0.12),
    { start: "top 92%", step: 0.11 },
  );

  // Publication: rule draws → opener and venue → the title rises line by
  // line out of masks → citation line and link.
  const pub = root.querySelector<HTMLElement>("[data-pub]");
  const pubTitle = pub?.querySelector<HTMLElement>("[data-pub-title]");
  if (pub && pubTitle) {
    SplitText.create(pubTitle, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      // Keep the real text in the accessibility tree.
      aria: "none",
      autoSplit: true,
      // Returning the timeline lets SplitText carry its progress across re-splits.
      onSplit: (self) =>
        gsap
          .timeline({ defaults: { ease: EASE.out }, scrollTrigger: { trigger: pub, start: "top 85%", once: true } })
          .from(all("[data-pub-line]", pub), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.4, ease: EASE.inOut }, 0)
          .from(all("[data-rec-fade], [data-pub-fade]", pub), { y: 18, opacity: 0, duration: 1, stagger: 0.1 }, 0.2)
          .from(self.lines, { yPercent: 115, rotate: 2, transformOrigin: "0% 0%", duration: 1.3, stagger: 0.1 }, 0.3)
          .from(all("[data-pub-foot]", pub), { y: 18, opacity: 0, duration: 1, stagger: 0.1 }, 0.75),
    });
  }

  // Spotlight: photos wipe up out of a clip, then the caption rises.
  batchReveal(
    all("[data-spotlight-photo]"),
    (photo) =>
      gsap
        .timeline()
        .fromTo(
          photo,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: EASE.inOut, clearProps: "clipPath" },
        ),
    { start: "top 88%", step: 0.15 },
  );
  all("[data-spotlight-text] > *").forEach((el, i) => {
    gsap.from(el, {
      y: 18,
      opacity: 0,
      duration: 1,
      delay: i * 0.08,
      ease: EASE.out,
      scrollTrigger: { trigger: el.parentElement, start: "top 92%", once: true },
    });
  });

  // Certifications: cards lift in, cascading.
  batchReveal(
    all("[data-cert-card]"),
    (card) => gsap.timeline().from(card, { y: 40, opacity: 0, duration: 1.1, ease: EASE.out }),
    { start: "top 92%", step: 0.09 },
  );
}
