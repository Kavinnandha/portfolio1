"use client";

import { useRef } from "react";
import Sparkle from "@/components/sections/stack/Sparkle";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const R = 80;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Circular text badge that turns slowly, speeds up with scroll velocity and
 * reverses with scroll direction (the same feel as the Stack ticker).
 * Decorative: aria-hidden, no pointer events; static under reduced motion.
 */
export default function Badge({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const ring = el?.querySelector<SVGSVGElement>("[data-ring]");
      if (!el || !ring || prefersReducedMotion()) return;

      gsap.from(el, {
        scale: 0.6,
        opacity: 0,
        rotate: -45,
        duration: 1.5,
        delay: 0.4,
        ease: EASE.out,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });

      const BASE = 16; // deg/s
      let dir = 1;
      let velocity = 0;
      let speed = BASE;
      let angle = 0;
      let lastY = window.scrollY;

      const tick = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 64) / 1000;
        if (dt <= 0) return;
        const y = window.scrollY;
        const dy = y - lastY;
        lastY = y;
        if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
        velocity += (Math.abs(dy) / dt - velocity) * Math.min(1, dt * 10);
        const target = dir * (BASE + Math.min(velocity * 0.12, BASE * 12));
        speed += (target - speed) * Math.min(1, dt * 3);
        angle = (angle + speed * dt) % 360;
        ring.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      };

      let running = false;
      const start = () => {
        if (running) return;
        running = true;
        lastY = window.scrollY;
        gsap.ticker.add(tick);
      };
      const stop = () => {
        if (!running) return;
        running = false;
        gsap.ticker.remove(tick);
      };
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? start() : stop()),
      });
      if (st.isActive) start();

      return () => {
        stop();
        ring.style.removeProperty("transform");
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none select-none", className)}>
      <svg data-ring viewBox="0 0 200 200" className="size-full will-change-transform">
        <defs>
          <path id="contact-badge-ring" d={`M100 100m-${R} 0a${R} ${R} 0 1 1 ${R * 2} 0a${R} ${R} 0 1 1 -${R * 2} 0`} />
        </defs>
        <text className="fill-paper-dim font-mono" fontSize="12.5">
          <textPath href="#contact-badge-ring" textLength={CIRCUMFERENCE.toFixed(2)} lengthAdjust="spacing">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <Sparkle className="size-[20%] text-accent" />
      </span>
    </div>
  );
}
