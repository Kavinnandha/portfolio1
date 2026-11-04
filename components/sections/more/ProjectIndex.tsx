"use client";

import { useRef } from "react";
import type { Project } from "@/lib/content";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import ProjectRow from "./ProjectRow";
import PreviewCard from "./PreviewCard";
import { useMediaQuery } from "./useMediaQuery";

/** The floating preview needs a mouse, room, and motion. */
const PREVIEW_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * Editorial index of the non-featured projects. Hairlines draw in and each
 * row's contents rise as it scrolls into view; hovering the list dims the
 * other rows, and on desktop a preview card follows the pointer.
 */
export default function ProjectIndex({ projects }: { projects: Project[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const preview = useMediaQuery(PREVIEW_QUERY);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      root.querySelectorAll<HTMLElement>("[data-more-row]").forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } });
        tl.from(row.querySelector("[data-more-line]"), {
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 1.4,
          ease: EASE.out,
        })
          .from(row.querySelector("[data-more-rise]"), { yPercent: 110, duration: 1.2, ease: EASE.out }, 0.08)
          .from(
            row.querySelectorAll("[data-more-anim]"),
            { y: 24, opacity: 0, duration: 1.1, ease: EASE.out, stagger: 0.05 },
            0.14,
          );
      });

      const end = root.querySelector("[data-more-end]");
      gsap.from(end, {
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: 1.4,
        ease: EASE.out,
        scrollTrigger: { trigger: end, start: "top 96%", once: true },
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative">
      <ol ref={listRef} className="group/list relative">
        {projects.map((p, i) => (
          <ProjectRow key={p.slug} project={p} order={i} />
        ))}
      </ol>
      <span aria-hidden data-more-end className="block h-px bg-line-strong" />
      {preview ? <PreviewCard projects={projects} listRef={listRef} /> : null}
    </div>
  );
}
