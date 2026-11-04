"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { isPreloaderDone, onPreloaderDone } from "@/lib/preloader";

const LenisContext = createContext<Lenis | null>(null);

let lenisInstance: Lenis | null = null;

/** The live Lenis instance (null under reduced motion or before mount). */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** React access to Lenis — re-renders once it exists. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;

/**
 * Scroll to an element, selector or pixel offset. Uses Lenis when it is
 * running, native scrolling otherwise (reduced motion, before hydration).
 */
export function scrollToTarget(target: string | number | HTMLElement, opts: { offset?: number; immediate?: boolean } = {}) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, easing: easeInOutExpo, offset: opts.offset ?? 0, immediate: opts.immediate });
    return;
  }
  const behavior: ScrollBehavior = prefersReducedMotion() || opts.immediate ? "auto" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
  window.scrollTo({ top, behavior });
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      autoRaf: false,
    });
    lenisInstance = instance;

    // Lenis drives native scroll position; ScrollTrigger just needs to hear
    // about every frame, on the same ticker GSAP renders on.
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Hold the page still while the preloader curtain is up.
    if (!isPreloaderDone()) instance.stop();
    const off = onPreloaderDone(() => instance.start());

    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishing an external instance to context
    setLenis(instance);

    return () => {
      off();
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisInstance = null;
      setLenis(null);
    };
  }, []);

  // In-page anchors (#work, #contact …) glide instead of jumping.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = hash === "#top" ? 0 : document.querySelector<HTMLElement>(hash);
      if (target === null) return;
      e.preventDefault();
      scrollToTarget(target);
      if (hash !== "#top") history.replaceState(null, "", hash);
      else history.replaceState(null, "", window.location.pathname);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
