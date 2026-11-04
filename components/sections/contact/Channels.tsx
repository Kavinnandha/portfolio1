"use client";

import { useRef } from "react";
import RollText from "@/components/ui/RollText";
import { ArrowUpRight } from "@/components/ui/Icons";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export type Channel = { label: string; value: string; href: string; external?: boolean };

const arrow = "transition-transform duration-500 ease-out-expo motion-reduce:transition-none";

/**
 * Secondary channels as ruled rows. On hover/focus the value rolls, the
 * arrow exits up-right as a fresh one slides in, and a line draws under the
 * row. Rules draw across and rows settle in on first view.
 */
export default function Channels({ items, className }: { items: Channel[]; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } })
        .from(
          el.querySelectorAll("[data-rule]"),
          { scaleX: 0, transformOrigin: "0% 50%", duration: 1.2, ease: EASE.inOut, stagger: 0.1 },
          0,
        )
        .from(el.querySelectorAll("[data-row]"), { opacity: 0, y: 24, duration: 1, ease: EASE.out, stagger: 0.08 }, 0.2);
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} className={className}>
      {items.map((item, i) => (
        <li key={item.label} className="relative">
          <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-line-inverse" />
          {i === items.length - 1 ? (
            <span data-rule aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line-inverse" />
          ) : null}
          <a
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            data-cursor="hover"
            className="group relative flex items-center justify-between gap-5 py-5 md:py-6"
          >
            <span data-row className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-0">
              <span className="label shrink-0 text-paper-dim sm:w-32 md:w-40">{item.label}</span>
              <span className="text-[1.0625rem] font-medium tracking-[-0.015em] text-paper sm:text-lede">
                <RollText text={item.value} step={10} />
              </span>
            </span>
            <span
              data-row
              className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-line-inverse text-paper transition-colors duration-500 ease-out-expo group-hover:border-paper group-hover:bg-paper group-hover:text-ink group-focus-visible:border-paper group-focus-visible:bg-paper group-focus-visible:text-ink md:size-12"
            >
              <ArrowUpRight
                className={cn(arrow, "group-hover:translate-x-[160%] group-hover:-translate-y-[160%] group-focus-visible:translate-x-[160%] group-focus-visible:-translate-y-[160%]")}
              />
              <ArrowUpRight
                className={cn(
                  arrow,
                  "absolute inset-0 m-auto -translate-x-[160%] translate-y-[160%] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0",
                )}
              />
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-paper transition-transform duration-700 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
