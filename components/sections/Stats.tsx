"use client";

import { useRef } from "react";
import { stats } from "@/lib/content";
import { cn } from "@/lib/cn";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { formatStat } from "./stats/format";

/** Grid columns: 2×2 on mobile, 4 across from lg. */
const COLS = 2;
const COLS_LG = 4;

function position(i: number, n: number, cols: number) {
  return { firstInRow: i % cols === 0, lastRow: i >= n - (n % cols || cols) };
}

/** Literal class strings for "shown below lg? / shown from lg?" (Tailwind needs static classes). */
function shownWhen(base: boolean, lg: boolean): string {
  if (base && lg) return "";
  if (!base && !lg) return "hidden";
  return base ? "lg:hidden" : "hidden lg:block";
}

function padLeft(firstBase: boolean, firstLg: boolean): string {
  if (firstBase) return firstLg ? "pl-0" : "pl-0 lg:pl-8";
  return firstLg ? "pl-5 md:pl-8 lg:pl-0" : "pl-5 md:pl-8";
}

/** Prefix/suffix: symbols ride high in the accent; unit words sit small on the baseline. */
function Affix({ text, side }: { text: string; side: "prefix" | "suffix" }) {
  const word = /[a-z]/i.test(text);
  return (
    <span
      className={cn(
        "tracking-[-0.01em]",
        word ? "text-[0.3em] text-muted" : "align-top text-[0.42em] leading-none text-accent",
        side === "prefix" ? "mr-[0.12em]" : "ml-[0.12em]",
      )}
    >
      {text.trim()}
    </span>
  );
}

type Counter = { node: Text | null; value: number; decimals: number };

/**
 * Four numbers in a hairline grid. The final values are in the server HTML;
 * on the client they count up from 0 the first time the grid scrolls into
 * view while the hairlines draw in.
 */
export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const grid = el?.querySelector("[data-stats-grid]");
      if (!el || !grid || prefersReducedMotion()) return;

      const counters: Counter[] = Array.from(el.querySelectorAll<HTMLElement>("[data-count]")).map((node) => ({
        // Write into React's own text node so its reference stays valid.
        node: node.firstChild instanceof Text ? node.firstChild : null,
        value: Number(node.dataset.value) || 0,
        decimals: Number(node.dataset.decimals) || 0,
      }));
      const write = (c: Counter, v: number) => {
        if (c.node) c.node.nodeValue = formatStat(v, c.decimals);
      };

      const xRules = el.querySelectorAll("[data-rule-x]");
      const yRules = el.querySelectorAll("[data-rule-y]");
      const items = el.querySelectorAll("[data-stat-in]");
      gsap.set(xRules, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(yRules, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(items, { opacity: 0, y: 18 });
      counters.forEach((c) => write(c, 0));

      const tl = gsap.timeline({
        defaults: { ease: EASE.out },
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      });
      tl.to(xRules, { scaleX: 1, duration: 1.5, ease: EASE.inOut, stagger: 0.06 }, 0)
        .to(yRules, { scaleY: 1, duration: 1.3, ease: EASE.inOut, stagger: 0.06 }, 0.15)
        .to(items, { opacity: 1, y: 0, duration: 1.1, stagger: 0.05 }, 0.25);
      counters.forEach((c, i) => {
        const state = { v: 0 };
        tl.to(state, { v: c.value, duration: 2.2, ease: "power4.out", onUpdate: () => write(c, state.v) }, 0.1 + i * 0.12);
      });

      // If the animation is torn down early, never leave a half-counted number behind.
      return () => counters.forEach((c) => write(c, c.value));
    },
    { scope: root },
  );

  return (
    <section ref={root} id="stats" className="container-site pb-section">
      <dl data-stats-grid className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const base = position(i, stats.length, COLS);
          const lg = position(i, stats.length, COLS_LG);
          const value = formatStat(stat.value, stat.decimals);
          return (
            <div
              key={stat.label}
              className={cn(
                "relative flex min-w-0 flex-col pt-7 pr-4 pb-9 md:pt-9 md:pr-8 md:pb-12",
                padLeft(base.firstInRow, lg.firstInRow),
              )}
            >
              <dt data-stat-in className="label mt-5 text-ink md:mt-6">
                {stat.label}
              </dt>
              <dd className="order-first">
                <span className="sr-only">{`${stat.prefix ?? ""}${value}${stat.suffix ?? ""}`}</span>
                <span
                  aria-hidden
                  className="block text-display font-medium whitespace-nowrap text-ink tabular-nums lg:text-[length:clamp(3rem,6.3vw,7.25rem)]"
                >
                  {stat.prefix ? <Affix text={stat.prefix} side="prefix" /> : null}
                  <span data-count data-value={stat.value} data-decimals={stat.decimals ?? 0}>
                    {value}
                  </span>
                  {stat.suffix ? <Affix text={stat.suffix} side="suffix" /> : null}
                </span>
                {/* Hairlines (positioned against the cell). */}
                <span data-rule-x aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
                <span
                  data-rule-x
                  aria-hidden
                  className={cn("absolute inset-x-0 bottom-0 h-px bg-line", shownWhen(base.lastRow, lg.lastRow))}
                />
                <span
                  data-rule-y
                  aria-hidden
                  className={cn("absolute inset-y-0 left-0 w-px bg-line", shownWhen(!base.firstInRow, !lg.firstInRow))}
                />
              </dd>
              <dd data-stat-in className="mt-2.5 max-w-[32ch] text-[0.9375rem] leading-snug text-muted">
                {stat.note}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
