"use client";

import { useRef, useState } from "react";
import type { Project } from "@/lib/content";
import { DUR, EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { TextLink } from "@/components/ui/Button";
import { ArrowUpRight, GitHub } from "@/components/ui/Icons";

type ProjectRowProps = {
  project: Project;
  /** Position in the list; the preview card uses it to pick a slide. */
  order: number;
};

type ProjectLink = { kind: "github" | "live" | "paper"; href: string };

/** "https://github.com/a/b/" → "github.com/a/b" */
function displayUrl(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

/**
 * One index row: a disclosure button (index, title, kicker, stack, year, +)
 * over a panel with the description, highlights and links. The panel is
 * always in the DOM; it collapses to zero height and `visibility: hidden`
 * (so it leaves the tab order and the accessibility tree) when closed.
 */
export default function ProjectRow({ project, order }: ProjectRowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);
  const { contextSafe } = useGSAP({ scope: rowRef });

  const triggerId = `more-${project.slug}-trigger`;
  const panelId = `more-${project.slug}-panel`;
  const stack = project.stack.join(" · ");
  const links: ProjectLink[] = (
    [
      { kind: "github", href: project.links.github },
      { kind: "live", href: project.links.live },
      { kind: "paper", href: project.links.paper },
    ] as const
  ).flatMap((l) => (l.href ? [{ kind: l.kind, href: l.href }] : []));

  const toggle = contextSafe((trigger: HTMLElement) => {
    const panel = trigger.closest("[data-more-row]")?.querySelector<HTMLElement>("[data-more-panel]");
    if (!panel) return;
    const next = !open;
    setOpen(next);

    const items = Array.from(panel.querySelectorAll<HTMLElement>("[data-more-item]"));
    gsap.killTweensOf([panel, ...items]);
    // Page height changed: re-measure every trigger below (the Lifecycle pin).
    const settle = () => ScrollTrigger.refresh();

    if (prefersReducedMotion()) {
      gsap.set(panel, { height: next ? "auto" : 0, visibility: next ? "visible" : "hidden" });
      if (next) gsap.set(items, { opacity: 1, y: 0 });
      settle();
      return;
    }

    if (next) {
      gsap.set(panel, { visibility: "visible" });
      gsap.fromTo(
        panel,
        { height: panel.offsetHeight },
        { height: "auto", duration: DUR.base, ease: EASE.out, onComplete: settle },
      );
      gsap.fromTo(
        items,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.slow, ease: EASE.out, stagger: 0.07, delay: 0.08 },
      );
    } else {
      gsap.to(items, { opacity: 0, duration: 0.25, ease: "power1.out" });
      gsap.to(panel, {
        height: 0,
        duration: 0.65,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(panel, { visibility: "hidden" });
          settle();
        },
      });
    }
  });

  return (
    <li
      ref={rowRef}
      data-more-row
      className="relative transition-opacity duration-500 ease-out-quart group-hover/list:opacity-40 hover:opacity-100! has-focus-visible:opacity-100!"
    >
      <span aria-hidden data-more-line className="absolute inset-x-0 top-0 block h-px bg-line-strong" />

      <h3>
        <button
          id={triggerId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={(e) => toggle(e.currentTarget)}
          data-more-trigger
          data-order={order}
          data-cursor="hover"
          className="group/row grid w-full cursor-pointer grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-3 py-6 text-left md:grid-cols-12 md:gap-x-6 md:py-8 lg:items-center lg:py-9"
        >
          <span
            aria-hidden
            data-more-anim
            className="label pt-[0.7em] text-muted transition-colors duration-500 group-hover/row:text-accent group-focus-visible/row:text-accent group-aria-expanded/row:text-accent md:col-span-1 lg:pt-0"
          >
            {project.index}
          </span>

          <span className="min-w-0 md:col-span-8 lg:col-span-6">
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-more-rise className="block">
                <span className="inline-block text-title font-medium text-ink transition-transform duration-700 ease-out-expo group-hover/row:translate-x-3 group-focus-visible/row:translate-x-3">
                  {project.title}
                </span>
              </span>
            </span>
            <span data-more-anim className="mt-2 block text-[0.95rem] leading-snug text-muted md:mt-3">
              {project.kicker}
              {project.year ? <span className="md:hidden"> · {project.year}</span> : null}
            </span>
          </span>

          {/* Shown on large screens; the panel carries it for everyone else. */}
          <span
            aria-hidden
            data-more-anim
            className="hidden font-mono text-[0.6875rem] leading-[1.7] tracking-[0.06em] text-ink-2 uppercase lg:col-span-3 lg:block"
          >
            {stack}
          </span>

          <span data-more-anim className="label hidden text-muted md:col-span-2 md:block lg:col-span-1">
            {project.year ?? <span aria-hidden>—</span>}
          </span>

          <span aria-hidden data-more-anim data-more-icon className="justify-self-end md:col-span-1">
            <span className="relative grid size-11 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-500 ease-out-quart group-hover/row:border-ink group-hover/row:bg-ink group-hover/row:text-paper group-focus-visible/row:border-ink group-focus-visible/row:bg-ink group-focus-visible/row:text-paper md:size-12">
              <span className="absolute h-px w-3.5 bg-current" />
              <span className="absolute h-3.5 w-px bg-current transition-transform duration-500 ease-out-expo group-aria-expanded/row:scale-y-0" />
            </span>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        data-more-panel
        className="invisible h-0 overflow-hidden"
      >
        <div className="grid gap-y-8 pb-10 md:grid-cols-12 md:gap-x-6 md:pb-14 lg:pb-16">
          <div className="md:col-span-10 md:col-start-2 lg:col-span-5 lg:col-start-2">
            <p data-more-item className="max-w-[46ch] text-lede text-ink-2">
              {project.description}
            </p>
            <p
              data-more-item
              className="mt-6 font-mono text-[0.6875rem] leading-[1.7] tracking-[0.06em] text-ink-2 uppercase lg:sr-only"
            >
              {stack}
            </p>
            {links.length ? (
              <ul data-more-item className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {links.map((l) => (
                  <li key={l.href}>
                    <TextLink href={l.href} external className="font-mono text-[0.8125rem] text-ink">
                      {l.kind === "github" ? <GitHub size={14} /> : null}
                      <span>{displayUrl(l.href)}</span>
                      <ArrowUpRight size={14} />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </TextLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <ol data-more-item className="border-t border-line md:col-span-10 md:col-start-2 lg:col-span-5 lg:col-start-8">
            {project.highlights.map((h, i) => (
              <li
                key={h}
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 border-b border-line py-4 text-[0.95rem] leading-snug text-ink-2"
              >
                <span aria-hidden className="label pt-[0.2em] text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </li>
  );
}
