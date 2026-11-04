"use client";

import { useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { onPreloaderDone } from "@/lib/preloader";

const ACTIVE_CLASS = "has-custom-cursor";
/** Fields keep the native caret; the custom cursor steps aside over them. */
const NATIVE = "input,textarea,select,[contenteditable='true'],[contenteditable='']";
const INTERACTIVE = `[data-cursor],a[href],button,[role='button'],summary,label[for],${NATIVE}`;
const CSS = `html.${ACTIVE_CLASS},html.${ACTIVE_CLASS} *:not(${NATIVE}){cursor:none!important}`;

const RING = 34;
const RING_HOVER = 68;
const DISC = 96;

type Mode = "default" | "hover" | "view" | "hidden";

function resolve(target: EventTarget | null): { mode: Mode; label: string } {
  const el = target instanceof Element ? target.closest(INTERACTIVE) : null;
  if (!el) return { mode: "default", label: "" };
  const kind = el.getAttribute("data-cursor");
  if (kind === "view") return { mode: "view", label: el.getAttribute("data-cursor-label") ?? "" };
  if (kind === "hide" || el.matches(NATIVE)) return { mode: "hidden", label: "" };
  if (kind === "hover") return { mode: "hover", label: "" };
  if (kind !== null || el.matches(":disabled,[aria-disabled='true']")) return { mode: "default", label: "" };
  return { mode: "hover", label: "" };
}

/**
 * Dot + trailing ring, blended with `difference` so it reads dark on paper
 * and light on ink. Hovered elements set the state through data attributes:
 * data-cursor="hover" | "view" (+ data-cursor-label) | "hide"; plain links and
 * buttons get "hover". Mouse/trackpad only, and only after the preloader.
 */
export default function Cursor() {
  const blendRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const blend = blendRef.current;
    const view = viewRef.current;
    if (!blend || !view || !hasFinePointer() || prefersReducedMotion()) return;

    const dot = blend.querySelector<HTMLElement>("[data-cursor-dot]");
    const ring = blend.querySelector<HTMLElement>("[data-cursor-ring]");
    const disc = view.querySelector<HTMLElement>("[data-cursor-disc]");
    const text = view.querySelector<HTMLElement>("[data-cursor-text]");
    if (!dot || !ring || !disc || !text) return;

    gsap.set([dot, ring, disc], { xPercent: -50, yPercent: -50, x: -200, y: -200 });
    gsap.set(disc, { scale: 0 });
    gsap.set([blend, view], { opacity: 0 });

    // Every motion is a quickTo, so pointer events never allocate tweens.
    const glide = (el: HTMLElement, duration: number) => ({
      x: gsap.quickTo(el, "x", { duration, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration, ease: "power3.out" }),
    });
    const followers = [glide(dot, 0.12), glide(ring, 0.5), glide(disc, 0.42)];
    const ringW = gsap.quickTo(ring, "width", { duration: 0.6, ease: "expo.out" });
    const ringH = gsap.quickTo(ring, "height", { duration: 0.6, ease: "expo.out" });
    const ringAlpha = gsap.quickTo(ring, "opacity", { duration: 0.3, ease: "power2.out" });
    const ringPress = gsap.quickTo(ring, "scale", { duration: 0.35, ease: "power3.out" });
    const dotScale = gsap.quickTo(dot, "scale", { duration: 0.35, ease: "power3.out" });
    const discScale = gsap.quickTo(disc, "scale", { duration: 0.55, ease: "expo.out" });
    const layerAlpha = [blend, view].map((el) => gsap.quickTo(el, "opacity", { duration: 0.25, ease: "power2.out" }));

    const html = document.documentElement;
    let mode: Mode = "default";
    let shown = false;

    const show = (on: boolean) => {
      if (on === shown) return;
      shown = on;
      layerAlpha.forEach((alpha) => alpha(on ? 1 : 0));
    };

    const apply = (next: Mode, label: string) => {
      if (next === "view" && text.textContent !== label) text.textContent = label;
      if (next === mode) return;
      mode = next;
      const size = next === "view" ? DISC : next === "hover" ? RING_HOVER : RING;
      ringW(size);
      ringH(size);
      ringAlpha(next === "default" || next === "hover" ? 1 : 0);
      dotScale(next === "default" ? 1 : 0);
      discScale(next === "view" ? 1 : 0);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        show(false);
        html.classList.remove(ACTIVE_CLASS);
        return;
      }
      // Re-entering: jump to the pointer instead of gliding in from the edge.
      const jump = !shown;
      for (const f of followers) {
        f.x(e.clientX, jump ? e.clientX : undefined);
        f.y(e.clientY, jump ? e.clientY : undefined);
      }
      if (jump) {
        html.classList.add(ACTIVE_CLASS);
        const { mode: next, label } = resolve(e.target);
        apply(next, label);
        show(true);
      }
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const { mode: next, label } = resolve(e.target);
      apply(next, label);
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) show(false); // left the window
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") ringPress(0.82);
    };
    const onUp = () => ringPress(1);

    let attached = false;
    const attach = () => {
      attached = true;
      blend.style.display = "block";
      view.style.display = "block";
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      document.addEventListener("pointerout", onOut, { passive: true });
    };
    // Keep the native arrow while the curtain is up.
    const off = onPreloaderDone(attach);

    return () => {
      off();
      if (attached) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerout", onOut);
      }
      html.classList.remove(ACTIVE_CLASS);
      blend.style.removeProperty("display");
      view.style.removeProperty("display");
    };
  });

  return (
    <>
      <style href="kn-cursor" precedence="default">
        {CSS}
      </style>
      {/* Blended layer: the root itself carries the blend mode, because a
          fixed, z-indexed element is an isolated group for its children. */}
      <div
        ref={blendRef}
        data-cursor-root
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[95] hidden mix-blend-difference"
      >
        <div
          data-cursor-ring
          className="absolute top-0 left-0 size-[34px] rounded-full border border-white will-change-transform"
        />
        <div data-cursor-dot className="absolute top-0 left-0 size-1.5 rounded-full bg-white will-change-transform" />
      </div>
      {/* Unblended layer for the accent "view" disc. */}
      <div ref={viewRef} data-cursor-root aria-hidden className="pointer-events-none fixed top-0 left-0 z-[95] hidden">
        <div
          data-cursor-disc
          className="absolute top-0 left-0 flex size-24 items-center justify-center rounded-full bg-accent text-white will-change-transform"
        >
          <span data-cursor-text className="label px-3 text-center" />
        </div>
      </div>
    </>
  );
}
