"use client";

import { Fragment, useRef } from "react";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import Sparkle from "./Sparkle";
import styles from "./Marquee.module.css";

type MarqueeProps = {
  rows: string[][];
  className?: string;
};

type Lane = {
  track: HTMLElement;
  copies: HTMLElement[];
  /** Travel while the page scrolls down: -1 runs left, 1 runs right. */
  sign: number;
  x: number;
  /** Distance from one copy to the next, in px (one seamless loop). */
  period: number;
};

/** Wraps x into (-period, 0], where the second copy takes over seamlessly. */
function wrap(x: number, period: number) {
  const r = x % period;
  return r > 0 ? r - period : r;
}

/**
 * Full-bleed ticker rows in display type. Rows run in opposite directions;
 * scroll speed throws them faster and scroll direction flips them, then they
 * ease back to a calm base speed. The loop only ticks while the band is on
 * screen. Without JS or under reduced motion the rows sit still.
 */
export default function Marquee({ rows, className }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      const lanes: Lane[] = [];
      el.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
        const track = row.querySelector<HTMLElement>("[data-track]");
        const copies = Array.from(row.querySelectorAll<HTMLElement>("[data-copy]"));
        if (track && copies.length > 1) lanes.push({ track, copies, sign: i % 2 ? 1 : -1, x: 0, period: 0 });
      });
      if (!lanes.length) return;

      // Base speed scales with the type, so phones and 4K screens feel alike.
      let base = 48;
      const measure = () => {
        base = (parseFloat(getComputedStyle(el).fontSize) || 96) * 0.5;
        lanes.forEach((lane, i) => {
          const period = lane.copies[1].getBoundingClientRect().left - lane.copies[0].getBoundingClientRect().left;
          if (period <= 0) return;
          // Keep each row's phase when the period changes (resize, font swap).
          lane.x = lane.period ? (lane.x / lane.period) * period : i % 2 ? -period * 0.38 : 0;
          lane.period = period;
          lane.track.style.transform = `translate3d(${lane.x.toFixed(2)}px,0,0)`;
        });
      };
      measure();
      const ro = new ResizeObserver(measure);
      lanes.forEach((lane) => ro.observe(lane.copies[0]));

      let dir = 1; // 1 while the page scrolls down, -1 while it scrolls up
      let velocity = 0; // smoothed scroll speed, px/s
      let speed = base; // signed travel speed, px/s
      let travel = 0;
      let lastY = window.scrollY;

      // Scroll speed is sampled from the real scroll position every frame, so
      // it is frame-rate independent and works for Lenis wheel scrolling and
      // native touch scrolling alike.
      const tick = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 64) / 1000;
        if (dt <= 0) return;
        const y = window.scrollY;
        const dy = y - lastY;
        lastY = y;
        if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
        velocity += (Math.abs(dy) / dt - velocity) * Math.min(1, dt * 10);
        const target = dir * (base + Math.min(velocity * 0.3, base * 9));
        speed += (target - speed) * Math.min(1, dt * 3.5);

        for (const lane of lanes) {
          if (!lane.period) continue;
          lane.x = wrap(lane.x + lane.sign * speed * dt, lane.period);
          lane.track.style.transform = `translate3d(${lane.x.toFixed(2)}px,0,0)`;
        }
        travel += speed * dt;
        el.style.setProperty("--spin", `${((travel * 0.3) % 360).toFixed(2)}deg`);
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

      // Pause the loop whenever the band is off screen.
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? start() : stop()),
      });
      if (st.isActive) start();

      // First view: each row rises out of its own mask.
      gsap.from(el.querySelectorAll("[data-rise]"), {
        yPercent: 120,
        duration: 1.4,
        ease: EASE.out,
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });

      return () => {
        stop();
        ro.disconnect();
        el.style.removeProperty("--spin");
        lanes.forEach((lane) => lane.track.style.removeProperty("transform"));
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative select-none text-display font-medium text-ink", className)}>
      {rows.map((words, r) => {
        // An even count keeps the solid/outline alternation seamless across copies.
        const items = words.length % 2 ? [...words, ...words] : words;
        return (
          <div
            key={r}
            data-row
            className={cn("relative overflow-hidden border-b border-line py-[0.12em]", r === 0 && "border-t")}
          >
            <p className="sr-only">{words.join(", ")}</p>
            <div data-rise aria-hidden="true">
              <div data-track className="flex w-max will-change-transform">
                {[0, 1].map((copy) => (
                  <div key={copy} data-copy className="flex shrink-0 items-center">
                    {items.map((word, i) => (
                      <Fragment key={i}>
                        <span className={cn("whitespace-nowrap px-[0.16em]", (i + r) % 2 === 1 && styles.outline)}>
                          {word}
                        </span>
                        <Sparkle
                          className="mx-[0.06em] size-[0.3em] shrink-0 text-accent will-change-transform"
                          style={{
                            transform: r % 2 ? "rotate(calc(var(--spin, 0deg) * -1))" : "rotate(var(--spin, 0deg))",
                          }}
                        />
                      </Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
