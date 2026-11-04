"use client";

import { useRef } from "react";
import { hero, profile } from "@/lib/content";
import { cn } from "@/lib/cn";
import { EASE, SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { PillLink } from "@/components/ui/Button";
import { ArrowDown, Download } from "@/components/ui/Icons";
import HeroCanvas from "./hero/HeroCanvas";
import { afterPreloader } from "./hero/afterPreloader";

// The brief asks for these two strings; lib/content.ts doesn't carry them yet.
const EDITION = hero.edition;
const SCROLL_CUE = hero.scrollCue;

/**
 * First screen. The h1 is the name, set huge and composed across the grid:
 * first name flush left, last name pushed right. On lg+ the statement + CTAs
 * tuck into the empty right side of the first name line (visually first via
 * `order`, but after the h1 in reading order), and the scroll cue sits left of
 * the last name.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe || prefersReducedMotion()) return;
      const all = (selector: string) => Array.from(el.querySelectorAll<HTMLElement>(selector));

      const bg = all("[data-hero-bg]");
      const depth = all("[data-hero-depth]");
      const lines = all("[data-hero-line]");
      const labels = all("[data-hero-label]");
      const rules = all("[data-hero-rule]");
      const statement = el.querySelector<HTMLElement>("[data-hero-statement]");
      const ctas = all("[data-hero-cta]");
      const facts = all("[data-hero-fact]");
      const cue = all("[data-hero-cue]");
      const cueLine = all("[data-hero-cue-line]");

      /* ── Entrance: initial states now (the preloader overlay hides them) ── */
      const name = SplitText.create(lines, { type: "lines,chars", mask: "lines", aria: "none" });
      // Widen each clip box so glyph overhang from the tight tracking isn't shaved.
      gsap.set(name.masks, { padding: "0.08em 0.12em 0.1em", margin: "-0.08em -0.12em -0.1em" });
      const lineChars = lines.map((line) => name.chars.filter((char) => line.contains(char)));

      gsap.set(name.chars, { yPercent: 120, rotate: 5, transformOrigin: "0% 100%" });
      gsap.set(bg, { opacity: 0, scale: 1.08, transformOrigin: "50% 35%" });
      gsap.set(labels, { yPercent: 110 });
      gsap.set(rules, { scaleX: 0, transformOrigin: "0% 50%" });
      if (statement) gsap.set(statement, { opacity: 0 });
      gsap.set(ctas, { opacity: 0, y: 26 });
      gsap.set(facts, { opacity: 0, y: 20 });
      gsap.set(cue, { opacity: 0 });

      // Scroll cue: a segment sweeps through the line, on loop, while in view.
      const cueLoop = gsap
        .timeline({ paused: true, repeat: -1, repeatDelay: 0.6 })
        .fromTo(cueLine, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.9, ease: EASE.inOut })
        .set(cueLine, { transformOrigin: "100% 50%" }, "+=0.15")
        .to(cueLine, { scaleX: 0, duration: 0.9, ease: EASE.inOut });
      let cueStarted = false;

      // The statement is split at play time (fonts are in by then), rises
      // line by line, then reverts to plain text so it reflows freely.
      const statementIn = contextSafe(() => {
        if (!statement) return;
        const split = SplitText.create(statement, { type: "lines", mask: "lines", aria: "none" });
        gsap.set(statement, { opacity: 1 });
        gsap.from(split.lines, {
          yPercent: 105,
          duration: 1.2,
          stagger: 0.08,
          ease: EASE.out,
          onComplete: () => split.revert(),
        });
      });

      const intro = gsap.timeline({ paused: true, defaults: { ease: EASE.out } });
      intro.to(bg, { opacity: 1, duration: 2.2, ease: "power2.out" }, 0).to(bg, { scale: 1, duration: 2.8 }, 0);
      lineChars.forEach((chars, i) => {
        intro.to(chars, { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.055 }, 0.1 + i * 0.14);
      });
      intro
        .to(rules, { scaleX: 1, duration: 1.6, ease: EASE.inOut, stagger: 0.15 }, 0.3)
        .to(labels, { yPercent: 0, duration: 1.1, stagger: 0.07 }, 0.5)
        .call(statementIn, undefined, 0.62)
        .to(ctas, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.9)
        .to(facts, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 1)
        .to(cue, { opacity: 1, duration: 1 }, 1.3)
        .call(
          () => {
            cueStarted = true;
            cueLoop.play();
          },
          undefined,
          1.5,
        );

      const cancelStart = afterPreloader(() => intro.play());

      /* ── Scroll-out: scrubbed depth as the hero leaves (transforms + opacity only) ── */
      const layer = (key: string) => all(`[data-hero-layer="${key}"]`);
      const vh = () => window.innerHeight;
      lines.forEach((line, i) => gsap.set(line, { transformOrigin: i % 2 ? "100% 100%" : "0% 100%" }));

      const out = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
          onLeave: () => cueLoop.pause(),
          onEnterBack: () => {
            if (cueStarted) cueLoop.play();
          },
        },
      });
      out.to(depth, { opacity: 0.12, scale: 1.06, yPercent: 7, duration: 1 }, 0);
      // Lines drift at different rates and part sideways: the first recedes
      // (lags more, shrinks), the second stays nearer the page.
      lines.forEach((line, i) => {
        out.to(
          line,
          i % 2
            ? { yPercent: 18, xPercent: 5, duration: 1 }
            : { yPercent: 55, xPercent: -6, scale: 0.94, duration: 1 },
          0,
        );
      });
      out
        .to(layer("top"), { y: -48, opacity: 0, duration: 0.3 }, 0)
        .to(layer("statement"), { y: () => -0.12 * vh(), opacity: 0, duration: 0.55 }, 0)
        .to(layer("cue"), { opacity: 0, duration: 0.25 }, 0)
        .to(layer("facts"), { y: () => -0.08 * vh(), opacity: 0, duration: 0.45 }, 0.05);

      return () => cancelStart();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-paper">
      <div data-hero-depth className="absolute inset-0 -z-10 will-change-transform">
        <HeroCanvas />
      </div>

      <div className="container-site flex flex-1 flex-col pt-28 pb-6 md:pt-32 md:pb-8">
        {/* Label row */}
        <div data-hero-layer="top">
          <ul className="label grid grid-cols-2 gap-x-6 gap-y-1.5 text-muted sm:flex sm:items-center sm:justify-between">
            <li className="overflow-hidden text-ink">
              <span data-hero-label className="block">
                {hero.eyebrow}
              </span>
            </li>
            <li className="row-start-2 overflow-hidden sm:row-auto">
              <span data-hero-label className="block">
                {hero.place}
              </span>
            </li>
            <li className="col-start-2 row-start-1 overflow-hidden text-right sm:col-auto sm:row-auto">
              <span data-hero-label className="block">
                {EDITION}
              </span>
            </li>
          </ul>
          <span data-hero-rule aria-hidden className="hairline mt-4 block md:mt-5" />
        </div>

        {/* Name block */}
        <div className="relative mt-auto flex flex-col pt-14 md:pt-20">
          <h1 className="text-display-xl font-medium text-ink max-lg:text-[length:clamp(4rem,min(25vw,40svh),15rem)]">
            <span className="sr-only">{`${profile.name}, ${profile.role}`}</span>
            <span aria-hidden className="block">
              {hero.nameLines.map((line, i) => (
                <span
                  key={line}
                  data-hero-line
                  className={cn("block w-fit whitespace-nowrap will-change-transform", i % 2 === 1 && "ml-auto")}
                >
                  {line}
                </span>
              ))}
            </span>
          </h1>

          {/* lg+: lifted beside the first name line; its bottom sits on that line's baseline. */}
          <div
            data-hero-layer="statement"
            className="relative z-10 mt-8 text-lede md:mt-10 lg:order-first lg:mt-0 lg:mb-[calc(var(--text-display-xl)*-0.775)] lg:ml-auto lg:w-fit"
          >
            <p data-hero-statement className="max-w-[34ch] text-pretty text-ink-2">
              {hero.statement}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-9 lg:flex-nowrap">
              <span data-hero-cta className="inline-flex">
                <PillLink
                  href={hero.primaryCta.href}
                  label={hero.primaryCta.label}
                  variant="solid"
                  icon={<ArrowDown />}
                  magnetic
                />
              </span>
              <span data-hero-cta className="inline-flex">
                <PillLink
                  href={hero.secondaryCta.href}
                  label={hero.secondaryCta.label}
                  variant="outline"
                  icon={<Download />}
                  download={profile.resume.fileName}
                />
              </span>
            </div>
          </div>

          <div
            data-hero-layer="cue"
            aria-hidden
            className="pointer-events-none absolute bottom-[calc(var(--text-display-xl)*0.065)] left-0 hidden items-center gap-4 lg:flex"
          >
            <span data-hero-cue className="label text-muted">
              {SCROLL_CUE}
            </span>
            <span data-hero-cue className="relative block h-px w-16 overflow-hidden bg-line-strong">
              <span data-hero-cue-line className="absolute inset-0 bg-ink" />
            </span>
          </div>
        </div>

        {/* Facts */}
        <div data-hero-layer="facts" className="mt-12 md:mt-16 lg:mt-20">
          <span data-hero-rule aria-hidden className="hairline block" />
          <dl className="mt-5 grid gap-y-3.5 sm:grid-cols-3 sm:gap-x-8 md:mt-6">
            {hero.facts.map((fact) => (
              <div key={fact.k} data-hero-fact className="grid grid-cols-[7rem_1fr] items-baseline gap-x-4 sm:block">
                <dt className="label text-muted">{fact.k}</dt>
                <dd className="text-[0.9375rem] leading-snug tracking-[-0.01em] text-ink sm:mt-2.5">{fact.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
