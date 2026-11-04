"use client";

import { useRef } from "react";
import type { SkillGroup } from "@/lib/content";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Column spans that always close the grid's rows, whatever the group count:
 * 1 col on phones, 2 from `sm`, 3 (as 6 half-columns) from `lg`. A lone
 * last card spans the full row, two leftovers split it.
 */
function spanFor(i: number, n: number) {
  const sm = n % 2 === 1 && i === n - 1 ? "sm:col-span-2" : "";
  const rem = n % 3;
  const lg =
    rem === 1 && i === n - 1 ? "lg:col-span-6" : rem === 2 && i >= n - 2 ? "lg:col-span-3" : "lg:col-span-2";
  return cn(sm, lg);
}

/**
 * The stack as a spec sheet: hairline-ruled cells, each with a title, a mono
 * note on why the group exists, and its tools as chips. Cells rise in as they
 * reach the viewport (batched, so phones and desktops both stagger nicely);
 * on hover-capable devices a cell lifts its chips. Nothing is hover-only.
 */
export default function SkillGrid({ groups, className }: { groups: SkillGroup[]; className?: string }) {
  const root = useRef<HTMLUListElement>(null);
  const n = groups.length;

  useGSAP(
    (_context, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe || prefersReducedMotion()) return;

      // Cells stay opaque (they paint the hairline grid); their contents animate.
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
      gsap.set(el.querySelectorAll("[data-head]"), { opacity: 0, y: 40 });
      gsap.set(el.querySelectorAll("[data-chip]"), { opacity: 0, y: 14 });

      ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        onEnter: contextSafe((batch: Element[]) => {
          const tl = gsap.timeline();
          batch.forEach((card, i) => {
            const at = i * 0.09;
            tl.to(card.querySelectorAll("[data-head]"), { opacity: 1, y: 0, duration: 1.1, ease: EASE.out }, at);
            tl.to(
              card.querySelectorAll("[data-chip]"),
              { opacity: 1, y: 0, duration: 0.8, ease: EASE.out, stagger: 0.035 },
              at + 0.22,
            );
          });
        }),
      });
    },
    { scope: root },
  );

  return (
    <ul
      ref={root}
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-6",
        className,
      )}
    >
      {groups.map((group, i) => {
        const wide = n % 3 === 1 && i === n - 1;
        return (
          <li
            key={group.title}
            data-card
            className={cn(
              "group relative flex flex-col bg-paper p-6 transition-colors duration-500 ease-out-expo hover:bg-paper-2/60 sm:p-8 xl:p-10",
              wide && "lg:flex-row lg:items-end lg:justify-between lg:gap-16",
              spanFor(i, n),
            )}
          >
            <div data-head>
              <div className="flex items-center gap-3">
                <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span
                  aria-hidden
                  className="size-1.5 scale-0 rounded-full bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-100"
                />
              </div>
              <h3 className={cn("mt-10 text-title font-medium md:mt-14", wide && "lg:mt-10")}>{group.title}</h3>
              <p className="mt-3 font-mono text-[0.8125rem] leading-snug text-muted">{group.note}</p>
            </div>
            <ul
              className={cn(
                "mt-auto flex flex-wrap gap-2 pt-8 md:pt-10",
                wide && "lg:max-w-[60%] lg:justify-end lg:pt-0",
              )}
            >
              {group.items.map((item, j) => (
                <li key={item} data-chip>
                  <span
                    className="inline-flex rounded-full border border-line-strong px-3.5 py-1.5 text-[0.9375rem] leading-tight tracking-[-0.01em] text-ink-2 transition-[translate,border-color,color] duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:border-ink/50 group-hover:text-ink"
                    style={{ transitionDelay: `${j * 28}ms` }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
