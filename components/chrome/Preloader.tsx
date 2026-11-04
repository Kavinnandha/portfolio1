"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { footer, profile } from "@/lib/content";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { isPreloaderDone, markPreloaderDone } from "@/lib/preloader";
import { cn } from "@/lib/cn";
import { chromeCopy } from "./copy";

const SEEN_KEY = "kn:preloader-seen";
/** Never hold the curtain longer than this waiting for webfonts. */
const FONT_CAP_MS = 2500;
const REPEAT_FONT_CAP_MS = 1200;

/* The curtain's trailing edge: a drape that hangs low in the middle while
   the curtain lifts, then snaps flat as it clears the top of the viewport. */
const CURVE = "M0 0 L100 0 Q50 100 0 0 Z";
const FLAT = "M0 0 L100 0 Q50 0 0 0 Z";

/* The intro runs on CSS from first paint, before hydration, so the overlay is
   alive even on a slow connection. GSAP takes over for the count and exit.
   The failsafe hides the overlay if JavaScript never arrives or crashes. */
const CSS =
  "@keyframes kn-pl-rise{from{transform:translate3d(0,110%,0)}}" +
  "@keyframes kn-pl-fade{from{opacity:0}}" +
  "@keyframes kn-pl-failsafe{to{visibility:hidden}}" +
  "[data-preloader]{animation:kn-pl-failsafe 0s linear 8s forwards}" +
  "[data-pl-rise]{animation:kn-pl-rise 1.1s cubic-bezier(.16,1,.3,1) both}" +
  "[data-pl-fade]{animation:kn-pl-fade .9s cubic-bezier(.25,1,.5,1) both}";

const year = footer.copyright.match(/\d{4}/)?.[0] ?? "";

const after = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberIntro() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage blocked (private mode): the intro simply plays again */
  }
}

function fontsReady(capMs: number): Promise<void> {
  const ready = document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve();
  return Promise.race([ready, new Promise<void>((resolve) => setTimeout(resolve, capMs))]);
}

/** A line that rises out of its own mask. */
function Line({
  children,
  className,
  innerClassName,
  delay,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  delay: number;
}) {
  return (
    <span className={cn("block overflow-hidden", className)}>
      <span data-pl-rise className={cn("block", innerClassName)} style={after(delay)}>
        {children}
      </span>
    </span>
  );
}

/**
 * First-visit curtain: the name rises, a counter runs 000 → 100, then — once
 * webfonts are in — the ink curtain lifts away with a curved trailing edge.
 * markPreloaderDone() fires the instant the exit starts, so the hero plays
 * underneath the lifting curtain and scrolling unlocks.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe) return;

      // JavaScript is here: cancel the CSS failsafe, unless it already fired.
      const failsafeFired = getComputedStyle(el).visibility === "hidden";
      gsap.set(el, { animation: "none" });
      const remove = () => gsap.set(el, { display: "none" });

      if (isPreloaderDone() || failsafeFired) {
        markPreloaderDone();
        remove();
        return;
      }

      if (prefersReducedMotion()) {
        markPreloaderDone();
        gsap.to(el, { opacity: 0, duration: 0.15, ease: "none", onComplete: remove });
        return;
      }

      let alive = true;
      const q = gsap.utils.selector(el);

      // Repeat visit this session: no count, just a quick fade.
      if (hasSeenIntro()) {
        const fadeOut = contextSafe(() => {
          if (!alive) return;
          markPreloaderDone();
          gsap.set(el, { pointerEvents: "none" });
          gsap.to(el, { opacity: 0, duration: 0.4, ease: EASE.outSoft, onComplete: remove });
        });
        void fontsReady(REPEAT_FONT_CAP_MS).then(fadeOut);
        return () => {
          alive = false;
        };
      }

      // First visit: count to 100 in uneven steps, like real work.
      const counter = q("[data-pl-count]")[0];
      const setBar = gsap.quickSetter(q("[data-pl-bar]"), "scaleX");
      const progress = { value: 0 };
      const render = () => {
        if (counter) counter.textContent = String(Math.round(progress.value)).padStart(3, "0");
        setBar(progress.value / 100);
      };

      let counted = false;
      let fontsIn = false;
      let leaving = false;

      const exit = contextSafe(() => {
        if (!alive || leaving || !counted || !fontsIn) return;
        leaving = true;
        markPreloaderDone();
        rememberIntro();

        const rise = q("[data-pl-rise]");
        const fade = q("[data-pl-fade]");
        gsap
          .timeline({ onComplete: remove })
          .set(el, { pointerEvents: "none" })
          // Hand the CSS-animated elements over to GSAP.
          .set([...rise, ...fade], { animation: "none" })
          .to(rise, { yPercent: -110, duration: 0.6, ease: EASE.in, stagger: 0.035 }, 0)
          .to(fade, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0)
          .to(q("[data-pl-curtain]"), { yPercent: -100, duration: 1.05, ease: EASE.inOut }, 0.15)
          .to(q("[data-pl-curve]"), { attr: { d: FLAT }, duration: 1.05, ease: "power3.in" }, 0.15);
      });

      gsap
        .timeline({
          delay: 0.1,
          onUpdate: render,
          onComplete: () => {
            counted = true;
            exit();
          },
        })
        .to(progress, { value: 23, duration: 0.26, ease: "power2.out" })
        .to(progress, { value: 61, duration: 0.34, ease: "power2.inOut" }, "+=0.05")
        .to(progress, { value: 86, duration: 0.24, ease: "power2.inOut" }, "+=0.05")
        .to(progress, { value: 100, duration: 0.22, ease: "power3.out" }, "+=0.04");

      void fontsReady(FONT_CAP_MS).then(() => {
        fontsIn = true;
        exit();
      });

      return () => {
        alive = false;
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-preloader
      aria-hidden="true"
      className="fixed inset-0 z-[100] cursor-default touch-none overflow-hidden select-none"
    >
      <style href="kn-preloader" precedence="default">
        {CSS}
      </style>

      <div data-pl-curtain className="absolute inset-0 bg-ink text-paper will-change-transform">
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] h-[clamp(5rem,20vh,13rem)] w-full fill-ink"
        >
          <path data-pl-curve d={CURVE} />
        </svg>

        <div className="container-site flex h-full flex-col pt-5 pb-6 md:pt-8 md:pb-10">
          <div className="label flex items-start justify-between gap-6 text-paper-dim">
            <Line delay={0.1}>{profile.role}</Line>
            <Line delay={0.16}>{`${chromeCopy.portfolio} ©${year}`}</Line>
          </div>

          <div className="mt-[clamp(2.5rem,11vh,7.5rem)] text-[clamp(3rem,11vw,10rem)] leading-[0.92] font-medium tracking-[-0.055em]">
            <Line delay={0.18} className="pb-[0.04em]">
              {profile.firstName}
            </Line>
            <Line
              delay={0.26}
              className="pr-[0.12em] pb-[0.06em]"
              innerClassName="font-serif text-[1.06em] font-normal tracking-[-0.025em] italic"
            >
              {profile.lastName}
              <span aria-hidden className="ml-[0.05em] inline-block size-[0.13em] rounded-full bg-accent align-baseline" />
            </Line>
          </div>

          <div className="mt-auto flex items-end justify-between gap-6">
            <Line delay={0.22} className="label pb-[0.35rem] text-paper-dim">
              {profile.location}
            </Line>
            <Line
              delay={0.12}
              className="-mb-[0.04em] pt-[0.04em] font-mono text-[clamp(4.5rem,15vw,13rem)] leading-[0.85] font-medium tracking-[-0.06em] tabular-nums"
            >
              <span data-pl-count>000</span>
            </Line>
          </div>

          <div data-pl-fade style={after(0.2)} className="mt-5 h-px w-full bg-line-inverse md:mt-8">
            <div data-pl-bar className="h-full origin-left bg-paper" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
