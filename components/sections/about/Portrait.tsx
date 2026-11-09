"use client";

import Image from "next/image";
import { useRef } from "react";
import portrait from "@/public/portrait.webp";
import Parallax from "@/components/motion/Parallax";
import { about, profile } from "@/lib/content";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * The portrait wipes up out of a clip-path the first time it is seen, the
 * photo settling from a slight zoom, then drifts gently against the scroll.
 * The photo is pre-cropped to the frame's 4:5 so nothing important is cut.
 */
export default function Portrait({ className }: { className?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const frame = el.querySelector("[data-frame]");
      const zoom = el.querySelector("[data-zoom]");
      const caption = el.querySelectorAll("[data-caption] > *");

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } })
        .fromTo(
          frame,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: EASE.inOut, clearProps: "clipPath" },
          0,
        )
        .from(zoom, { scale: 1.3, duration: 2, ease: EASE.out }, 0.1)
        .from(caption, { opacity: 0, y: 12, duration: 0.9, ease: EASE.out, stagger: 0.08 }, 0.9);
    },
    { scope: root },
  );

  return (
    <figure ref={root} className={cn("group", className)}>
      <div data-frame className="relative overflow-hidden bg-paper-2">
        <Parallax amount={5} className="aspect-[4/5]">
          <div data-zoom className="relative aspect-[4/5] overflow-hidden bg-paper-2">
            <Image
              src={portrait}
              alt={about.portrait.alt}
              placeholder="blur"
              sizes="(min-width: 1024px) 36vw, (min-width: 640px) 24rem, 78vw"
              className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-[1.03]"
            />
          </div>
        </Parallax>
      </div>
      <figcaption data-caption className="label mt-4 flex items-center justify-between gap-4 text-muted">
        <span>{profile.name}</span>
        <span>{profile.role}</span>
      </figcaption>
    </figure>
  );
}
