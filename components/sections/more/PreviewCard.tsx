"use client";

import { useRef, type RefObject } from "react";
import type { Project } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import SystemGlyph from "./SystemGlyph";

type PreviewCardProps = {
  projects: Project[];
  /** The index list whose row triggers drive the card. */
  listRef: RefObject<HTMLElement | null>;
};

/** Gap between the pointer and the card, and the card's margin to the viewport. */
const OFFSET = 28;
const MARGIN = 20;

/**
 * Desktop-only flourish (mounted for fine pointers without reduced motion):
 * a card that trails the pointer while it is over a collapsed row trigger,
 * tilting with horizontal velocity. Its slides sit in a vertical strip that
 * glides to the hovered project. Purely decorative — every word in it is also
 * in the row or its panel — so it is aria-hidden and never takes pointer events.
 */
export default function PreviewCard({ projects, listRef }: PreviewCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const count = projects.length;

  useGSAP(
    () => {
      const card = cardRef.current;
      const list = listRef.current;
      const strip = card?.querySelector<HTMLElement>("[data-preview-strip]");
      if (!card || !list || !strip) return;
      const slides = Array.from(card.querySelectorAll<HTMLElement>("[data-preview-slide]"));

      gsap.set(card, { opacity: 0, scale: 0.86, rotation: 0, transformOrigin: "50% 50%" });
      const xTo = gsap.quickTo(card, "x", { duration: 0.7, ease: "power3" });
      const yTo = gsap.quickTo(card, "y", { duration: 0.7, ease: "power3" });
      const rotateTo = gsap.quickTo(card, "rotation", { duration: 0.55, ease: "power3" });
      const slideTo = gsap.quickTo(strip, "yPercent", { duration: 0.85, ease: "expo.out" });
      const reveal = gsap.to(card, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out", paused: true });
      const level = gsap.delayedCall(0.12, () => rotateTo(0)).pause();

      // Each slide's glyph draws itself in when it becomes active…
      const intros = slides.map((slide) => {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(
          slide.querySelectorAll("[data-glyph-edge]"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut", stagger: 0.08 },
          0,
        )
          .fromTo(
            slide.querySelectorAll("[data-glyph-node]"),
            { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" },
            { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2)", stagger: 0.05 },
            0,
          )
          .fromTo(slide.querySelectorAll("[data-glyph-dashed]"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.35);
        return tl;
      });

      // …then sends a signal dot along each solid edge, on a loop.
      const loops = slides.map((slide) => {
        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.3 });
        slide.querySelectorAll<SVGCircleElement>("[data-glyph-signal]").forEach((dot, k) => {
          const at = k * 0.28;
          const d = dot.dataset;
          tl.fromTo(
            dot,
            { attr: { cx: Number(d.x1), cy: Number(d.y1) } },
            { attr: { cx: Number(d.x2), cy: Number(d.y2) }, duration: 1.1, ease: "power1.inOut" },
            at,
          )
            .fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" }, at)
            .to(dot, { opacity: 0, duration: 0.25, ease: "none" }, at + 0.85);
        });
        return tl;
      });

      let active = -1;
      let shown = false;
      let inside = false;
      let px = 0;
      let py = 0;
      let lastX = 0;
      let frame = 0;

      const place = (jump: boolean) => {
        const w = card.offsetWidth;
        const h = card.offsetHeight;
        let x = px + OFFSET;
        if (x + w > window.innerWidth - MARGIN) x = px - OFFSET - w;
        const y = gsap.utils.clamp(MARGIN, Math.max(MARGIN, window.innerHeight - h - MARGIN), py - h / 2);
        if (jump) {
          xTo(x, x);
          yTo(y, y);
        } else {
          xTo(x);
          yTo(y);
        }
      };

      const activate = (i: number, jump: boolean) => {
        if (i === active) return;
        if (active >= 0) loops[active]?.pause();
        active = i;
        const target = (-100 / count) * i;
        if (jump) slideTo(target, target);
        else slideTo(target);
        intros[i]?.restart();
        loops[i]?.restart();
      };

      const hide = () => {
        if (!shown) return;
        shown = false;
        reveal.timeScale(1.6).reverse();
        if (active >= 0) loops[active]?.pause();
        active = -1;
      };

      const triggerFrom = (node: Element | null) => {
        const trigger = node?.closest<HTMLElement>("[data-more-trigger]");
        return trigger && list.contains(trigger) ? trigger : null;
      };

      // Show only over collapsed rows: an open row already shows everything.
      const update = (trigger: HTMLElement | null) => {
        const i = Number(trigger?.dataset.order);
        if (!trigger || trigger.getAttribute("aria-expanded") === "true" || !(i >= 0 && i < count)) {
          hide();
          return;
        }
        const jump = reveal.progress() === 0;
        place(jump);
        activate(i, jump);
        if (!shown) {
          shown = true;
          reveal.timeScale(1).play();
        }
      };

      const onEnter = (e: PointerEvent) => {
        lastX = e.clientX;
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        inside = true;
        px = e.clientX;
        py = e.clientY;
        rotateTo(gsap.utils.clamp(-8, 8, (px - lastX) * 0.35));
        lastX = px;
        level.restart(true);
        update(triggerFrom(e.target as Element | null));
      };
      const onLeave = () => {
        inside = false;
        hide();
      };
      // Scrolling (or toggling a row) changes what is under a still pointer.
      const recheck = () => {
        if (!inside) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => update(triggerFrom(document.elementFromPoint(px, py))));
      };

      list.addEventListener("pointerenter", onEnter);
      list.addEventListener("pointermove", onMove);
      list.addEventListener("pointerleave", onLeave);
      list.addEventListener("click", recheck);
      window.addEventListener("scroll", recheck, { passive: true });
      return () => {
        cancelAnimationFrame(frame);
        list.removeEventListener("pointerenter", onEnter);
        list.removeEventListener("pointermove", onMove);
        list.removeEventListener("pointerleave", onLeave);
        list.removeEventListener("click", recheck);
        window.removeEventListener("scroll", recheck);
      };
    },
    { scope: cardRef },
  );

  return (
    <div
      ref={cardRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 h-[28rem] w-[21rem] overflow-hidden rounded-2xl bg-ink text-paper opacity-0 shadow-[0_32px_70px_-28px_rgb(15_15_14/0.55)] will-change-transform"
    >
      <div data-preview-strip style={{ height: `${count * 100}%` }}>
        {projects.map((p) => {
          const kinds = Array.from(new Set(p.architecture.nodes.map((n) => n.kind)));
          return (
            <div key={p.slug} data-preview-slide className="flex flex-col p-5" style={{ height: `${100 / count}%` }}>
              <div className="label flex items-center justify-between text-paper-dim">
                <span className="text-paper">{p.index}</span>
                <span>{p.year ?? ""}</span>
              </div>
              <div className="mt-4 rounded-xl border border-line-inverse px-3 pt-3 pb-2.5">
                <SystemGlyph architecture={p.architecture} className="h-[7rem] w-full" />
                <p className="mt-2 font-mono text-[0.625rem] tracking-[0.08em] text-paper-dim uppercase">
                  {kinds.join(" · ")}
                </p>
              </div>
              <p className="label mt-5 text-accent-soft">{p.kicker}</p>
              <p className="mt-2.5 text-[0.9375rem] leading-[1.45] text-paper">{p.summary}</p>
              <p className="mt-auto pt-4 font-mono text-[0.625rem] leading-[1.7] tracking-[0.08em] text-paper-dim uppercase">
                {p.stack.join(" · ")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
