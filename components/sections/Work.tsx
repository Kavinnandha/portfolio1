"use client";

import { useRef, useState, type CSSProperties } from "react";
import { featuredProjects, sections } from "@/lib/content";
import { EASE, ScrollTrigger, SplitText, gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/components/providers/SmoothScroll";
import SectionHeader, { Emphasis } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import ProjectPanel from "./work/ProjectPanel";

type Mode = "pinned" | "stacked" | "static";

/** The pinned horizontal gallery runs only where a panel fits and motion is welcome. */
// 1180px: below this the pinned diagrams' smallest text drops under ~10px.
const PIN_QUERY = "(min-width: 1180px) and (min-height: 700px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

const pad = (n: number) => String(n).padStart(2, "0");

// Panel geometry for the pinned track, in container units of the stage, so the
// first panel lines up with the page grid and the scrollbar is never counted.
const STAGE_VARS = {
  "--panel-w": "calc(min(100cqw, 100rem) - 2 * var(--spacing-gutter))",
  "--track-pad": "calc((100cqw - min(100cqw, 100rem)) / 2 + var(--spacing-gutter))",
  "--panel-gap": "calc(2 * var(--spacing-gutter))",
} as CSSProperties;

/**
 * Selected work. Desktop (≥1024×700, motion allowed): the section pins and a
 * scrubbed horizontal track carries five project panels; each panel reveals,
 * parallaxes and plays its architecture diagram as it slides in. Everywhere
 * else: the same panels stacked vertically, revealing on scroll. Without JS
 * or with reduced motion the stacked layout renders fully, unanimated.
 */
export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [played, setPlayed] = useState<boolean[]>(() => featuredProjects.map(() => false));
  const pinned = mode === "pinned";
  const total = featuredProjects.length;

  // 1 · Pick the layout from media queries; gsap.matchMedia re-runs on change.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: PIN_QUERY, reduce: REDUCE_QUERY }, (ctx) => {
        const { desktop, reduce } = ctx.conditions ?? {};
        setMode(reduce ? "static" : desktop ? "pinned" : "stacked");
      });
      // Web fonts swapping in change text heights above and inside the pin.
      let alive = true;
      document.fonts?.ready.then(() => {
        if (alive) ScrollTrigger.refresh();
      });
      return () => {
        alive = false;
      };
    },
    { scope: sectionRef },
  );

  // 2 · Build the motion for the current layout.
  useGSAP(
    () => {
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!stage || !track || (mode !== "pinned" && mode !== "stacked")) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", track);

      const reveal = (panel: HTMLElement, st: ScrollTrigger.Vars) => {
        gsap.from(panel.querySelectorAll("[data-reveal]"), {
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: EASE.out,
          stagger: 0.07,
          scrollTrigger: { ...st },
        });
        const title = panel.querySelector<HTMLElement>("[data-title]");
        if (!title) return;
        SplitText.create(title, {
          type: "lines,words",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 115,
              duration: 1.15,
              ease: EASE.out,
              stagger: 0.045,
              scrollTrigger: { ...st },
            }),
        });
      };

      if (mode === "stacked") {
        panels.forEach((panel) => reveal(panel, { trigger: panel, start: "top 80%", once: true }));
        return;
      }

      // Pinned. A panel whose content can't fit the viewport would be clipped:
      // fall back to the stacked layout instead.
      const overflows = () =>
        panels.some((panel) => {
          const article = panel.firstElementChild as HTMLElement | null;
          return !!article && article.scrollHeight > article.clientHeight + 2;
        });
      if (overflows()) {
        setMode("stacked");
        return;
      }

      const markPlayed = (i: number) =>
        setPlayed((prev) => (prev[i] ? prev : prev.map((v, k) => v || k === i)));

      const current = stage.querySelector<HTMLElement>("[data-current]");
      const currentTitle = stage.querySelector<HTMLElement>("[data-current-title]");
      const fill = stage.querySelector<HTMLElement>("[data-progress-fill]");
      let shown = 0;
      const updateReadout = (progress: number) => {
        if (fill) gsap.set(fill, { scaleX: progress });
        const i = Math.min(total - 1, Math.round(progress * (total - 1)));
        if (i === shown) return;
        shown = i;
        if (current) current.textContent = featuredProjects[i].index;
        if (currentTitle) currentTitle.textContent = featuredProjects[i].title;
      };

      const travel = () => Math.max(0, track.scrollWidth - stage.clientWidth);
      const tween = gsap.to(track, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${travel()}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Declaring a priority turns on ScrollTrigger's page-order sorting, so
          // this pin (built after a re-render) still refreshes before the
          // sections below it and pushes their triggers down correctly.
          refreshPriority: 0,
          onUpdate: (self) => updateReadout(self.progress),
          onRefresh: () => {
            if (overflows()) setMode("stacked");
          },
        },
      });

      panels.forEach((panel, i) => {
        if (i === 0) {
          reveal(panel, { trigger: stage, start: "top 65%", once: true });
          ScrollTrigger.create({ trigger: stage, start: "top 45%", once: true, onEnter: () => markPlayed(0) });
          return;
        }
        reveal(panel, { trigger: panel, containerAnimation: tween, start: "left 82%", once: true });
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: tween,
          start: "left 62%",
          once: true,
          onEnter: () => markPlayed(i),
        });
        // Depth as the panel slides in: the plate and its numeral trail behind the text.
        const slide = { trigger: panel, containerAnimation: tween, start: "left right", end: "left 25%", scrub: true };
        const plate = panel.querySelector("[data-plate]");
        const numeral = panel.querySelector("[data-numeral]");
        if (plate) gsap.fromTo(plate, { xPercent: 8 }, { xPercent: 0, ease: "none", scrollTrigger: { ...slide } });
        if (numeral) gsap.fromTo(numeral, { xPercent: 45 }, { xPercent: 0, ease: "none", scrollTrigger: { ...slide } });
      });

      // Tabbing into an off-screen panel scrolls the page to where that panel
      // is in view (the stage is overflow: clip, so the browser can't).
      const onFocus = (e: FocusEvent) => {
        const panel = (e.target as Element | null)?.closest<HTMLElement>("[data-panel]");
        const st = tween.scrollTrigger;
        const max = travel();
        if (!panel || !st || !max) return;
        const offset = gsap.utils.clamp(0, max, panel.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft));
        const y = st.start + (offset / max) * (st.end - st.start);
        if (Math.abs(window.scrollY - y) < 2) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 0.9 });
        else window.scrollTo({ top: y });
      };
      track.addEventListener("focusin", onFocus);

      ScrollTrigger.refresh();
      return () => track.removeEventListener("focusin", onFocus);
    },
    { scope: sectionRef, dependencies: [mode], revertOnUpdate: true },
  );

  return (
    <section id="work" ref={sectionRef} aria-label={sections.work.label} className="relative">
      <div className="container-site pt-section">
        <SectionHeader
          index={sections.work.index}
          label={sections.work.label}
          meta={sections.work.meta}
          title={<Emphasis text={sections.work.title} />}
        />
      </div>

      <div
        ref={stageRef}
        style={pinned ? STAGE_VARS : undefined}
        className={pinned ? "relative h-svh overflow-clip [container-type:inline-size]" : "container-site pb-section"}
      >
        <ol
          ref={trackRef}
          className={cn(
            pinned ? "flex h-full w-max gap-[var(--panel-gap)] px-[var(--track-pad)] pt-20 pb-16" : "flex flex-col",
          )}
        >
          {featuredProjects.map((project, i) => (
            <ProjectPanel key={project.slug} project={project} pinned={pinned} play={pinned ? played[i] : undefined} />
          ))}
        </ol>

        {pinned ? (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 pb-6">
            <div className="container-site label flex items-center gap-5 text-muted">
              <span className="text-ink tabular-nums">
                <span data-current>{featuredProjects[0].index}</span> / {pad(total)}
              </span>
              <span className="relative h-px flex-1 overflow-hidden bg-line">
                <span
                  data-progress-fill
                  className="absolute inset-0 origin-left bg-ink"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
              <span data-current-title className="min-w-[14ch] text-right text-ink">
                {featuredProjects[0].title}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
