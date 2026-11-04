import { DUR, EASE, ScrollTrigger, gsap } from "@/lib/gsap";

/**
 * Motion for the Lifecycle trace. Both setups run synchronously inside a
 * gsap.matchMedia() callback, so every tween, set and ScrollTrigger they
 * create is recorded and reverted when the media query stops matching.
 */

/** Hard terminal blink for a repeating tween: on for the first half, off for the second. */
const blink = (p: number) => (p < 0.5 ? 0 : 1);

function all<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** Phones, tablets, short screens: the rail draws with scroll and each layer reveals. */
export function flowTrace(root: HTMLElement): void {
  const list = root.querySelector<HTMLElement>("[data-lc-flow-list]");
  const fill = list?.querySelector<HTMLElement>("[data-lc-flow-fill]");
  if (!list || !fill) return;

  gsap.fromTo(
    fill,
    { scaleY: 0, transformOrigin: "50% 0%" },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: list, start: "top 72%", end: "bottom 72%", scrub: 0.5 },
    },
  );

  for (const step of all(list, "[data-lc-flow-step]")) {
    // The dot lights as the rail's tip (pinned to the 72% line) reaches it.
    gsap.fromTo(
      step.querySelector("[data-lc-flow-dot]"),
      { scale: 0 },
      {
        scale: 1,
        duration: 0.6,
        ease: "back.out(2.5)",
        scrollTrigger: { trigger: step, start: "top 72%", toggleActions: "play none none reverse" },
      },
    );
    gsap.from(step.querySelectorAll("[data-lc-flow-item]"), {
      y: 28,
      opacity: 0,
      duration: DUR.slow,
      ease: EASE.out,
      stagger: 0.08,
      scrollTrigger: { trigger: step, start: "top 86%", once: true },
    });
  }

  const caret = list.querySelector("[data-lc-flow-caret]");
  if (caret) {
    gsap.to(caret, {
      opacity: 0,
      duration: 1.1,
      ease: blink,
      repeat: -1,
      scrollTrigger: { trigger: caret, start: "top bottom", end: "bottom top", toggleActions: "play pause resume pause" },
    });
  }
}

/**
 * Desktop: pin the stage and send one request down through the layers.
 *
 * Two timelines:
 * - `travel` is scrubbed by scroll — the packet, the rail fill, each stop
 *   lighting up on arrival, and the response riding back up to the client.
 * - `state` is discrete — body cross-fades, the step counter and the typed
 *   log lines. The scrubbed playhead picks a label ("idle", "s0"…"s{n}") and
 *   `state` is tweened there, so scrolling back un-types the log.
 */
export function pinnedTrace(root: HTMLElement): (() => void) | undefined {
  const stage = root.querySelector<HTMLElement>("[data-lc-stage]");
  if (!stage) return;
  const one = (selector: string) => stage.querySelector<HTMLElement>(selector);

  const fill = one("[data-lc-fill]");
  const mover = one("[data-lc-mover]");
  const packet = one("[data-lc-packet]");
  const pulse = one("[data-lc-pulse]");
  const back = one("[data-lc-return]");
  const backPacket = one("[data-lc-return-packet]");
  const counter = one("[data-lc-counter]");
  const terminal = one("[data-lc-terminal]");
  const lit = all(stage, "[data-lc-lit]");
  const texts = all(stage, "[data-lc-text]");
  const bodies = all(stage, "[data-lc-body]");
  const lines = all(stage, "[data-lc-line]");
  const types = all(stage, "[data-lc-type]");
  const carets = all(stage, "[data-lc-caret]");
  const n = lit.length;

  if (!fill || !mover || !packet || !pulse || !back || !backPacket || !counter || !terminal) return;
  if (n < 2 || texts.length !== n || bodies.length !== n) return;
  if (lines.length !== n + 1 || types.length !== n + 1 || carets.length !== n + 1) return;

  // Show the stage; FlowTrace drops to screen-reader-only (see the Tailwind
  // group-data variants). Reverted with the context.
  gsap.set(root, { attr: { "data-lc-mode": "pinned" } });

  // Resting state: the packet waits at the first stop and nothing is logged.
  gsap.set(fill, { scaleY: 0, transformOrigin: "50% 0%" });
  gsap.set(mover, { yPercent: -100 });
  gsap.set(lit, { scale: 0, opacity: 0 });
  gsap.set(lit[0], { scale: 1, opacity: 1 });
  gsap.set(texts, { opacity: 0.3 });
  gsap.set(texts[0], { opacity: 1 });
  gsap.set(bodies, { opacity: 0, y: 36 });
  gsap.set(bodies[0], { opacity: 1, y: 0 });
  gsap.set(lines, { opacity: 0 });
  gsap.set(lines[0], { opacity: 1 });
  gsap.set(types, { width: "0ch" });
  gsap.set(carets, { visibility: "hidden" });
  gsap.set(carets[0], { visibility: "visible" });

  /* ── Discrete state ─────────────────────────────────────────────────── */
  const state = gsap.timeline({ paused: true });

  // Monospace, so typing is a stepped width tween in `ch`: one step per character.
  const typeLine = (i: number, at: number) => {
    const el = types[i];
    const chars = Math.max(1, Number(el.dataset.chars) || el.textContent?.length || 1);
    const d = gsap.utils.clamp(0.3, 0.9, chars * 0.018);
    state.fromTo(
      el,
      { width: "0ch" },
      { width: `${chars}ch`, duration: d, ease: `steps(${chars})`, immediateRender: false },
      at,
    );
    // Settle on the natural width in case a glyph renders wider than 1ch.
    state.set(el, { width: "auto" }, at + d);
  };

  state.addLabel("idle", 0);
  typeLine(0, 0);
  state.addLabel("s0");

  for (let i = 1; i < n; i++) {
    const at = state.duration();
    state.fromTo(
      bodies[i - 1],
      { opacity: 1, y: 0 },
      { opacity: 0, y: -28, duration: 0.35, ease: "power2.in", immediateRender: false },
      at,
    );
    state.fromTo(
      bodies[i],
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: 0.8, ease: EASE.outSoft, immediateRender: false },
      at + 0.22,
    );
    state.fromTo(
      counter,
      { yPercent: (-100 * (i - 1)) / n },
      { yPercent: (-100 * i) / n, duration: 0.6, ease: "power3.inOut", immediateRender: false },
      at,
    );
    state.set(carets[i - 1], { visibility: "hidden" }, at + 0.12);
    state.set(lines[i], { opacity: 1 }, at + 0.12);
    state.set(carets[i], { visibility: "visible" }, at + 0.12);
    typeLine(i, at + 0.16);
    state.addLabel(`s${i}`);
  }

  const responseAt = state.duration();
  state.set(carets[n - 1], { visibility: "hidden" }, responseAt + 0.05);
  state.set(lines[n], { opacity: 1 }, responseAt + 0.05);
  state.set(carets[n], { visibility: "visible" }, responseAt + 0.05);
  typeLine(n, responseAt + 0.1);
  state.addLabel(`s${n}`);

  /* ── Continuous travel (scrubbed) ───────────────────────────────────── */
  const DWELL = 0.7;
  const TRAVEL = 0.55;
  const travel = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  travel.addLabel("a0", 0).to({}, { duration: DWELL });
  for (let i = 1; i < n; i++) {
    const p = i / (n - 1);
    travel.to(mover, { yPercent: -100 + 100 * p, duration: TRAVEL, ease: "power2.inOut" });
    travel.to(fill, { scaleY: p, duration: TRAVEL, ease: "power2.inOut" }, "<");
    travel.addLabel(`a${i}`);
    travel.to(lit[i], { scale: 1, opacity: 1, duration: 0.14, ease: "power2.out" }, `a${i}-=0.08`);
    travel.to(texts[i], { opacity: 1, duration: 0.14 }, "<");
    travel.to({}, { duration: DWELL }, `a${i}`);
  }

  // The response rides back up the rail to the client.
  const turn = travel.duration();
  travel.to(packet, { scale: 0.3, opacity: 0, duration: 0.2 }, turn);
  travel.fromTo(backPacket, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2 }, turn);
  travel.fromTo(back, { yPercent: 0 }, { yPercent: -100, duration: 1.2, ease: "power2.inOut" }, turn + 0.05);
  travel.addLabel(`a${n}`);
  travel.to({}, { duration: DWELL + 0.3 });

  const marks = Array.from({ length: n + 1 }, (_, k) => (travel.labels[`a${k}`] ?? 0) / travel.duration());
  const indexAt = (progress: number) => {
    let k = 0;
    for (let j = 1; j < marks.length; j++) if (progress >= marks[j] - 1e-4) k = j;
    return k;
  };

  let alive = true;
  let current = Number.NaN;
  let seek: gsap.core.Tween | null = null;

  /** Move the discrete state to step `idx` (-1 = idle, n = response logged). */
  const go = (idx: number, instant = false) => {
    if (!alive || idx === current) return;
    current = idx;
    const time = state.labels[idx < 0 ? "idle" : `s${idx}`] ?? 0;
    seek?.kill();
    seek = null;
    if (instant) {
      state.time(time);
      return;
    }
    const distance = Math.abs(time - state.time());
    seek = state.tweenTo(time, { duration: gsap.utils.clamp(0.3, 1.25, distance * 0.8), ease: "none" });
  };

  const pulseLoop = gsap.fromTo(
    pulse,
    { scale: 1, opacity: 0.5 },
    { scale: 2.8, opacity: 0, duration: 1.5, ease: "power2.out", repeat: -1, paused: true },
  );

  const pin = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: () => `+=${Math.round(window.innerHeight * 4.4)}`,
    pin: true,
    scrub: 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    animation: travel,
    onToggle: (self) => {
      if (self.isActive) pulseLoop.play();
      else pulseLoop.pause();
    },
    onLeaveBack: () => go(-1),
  });

  // Follow the smoothed playhead (not raw scroll), so each text change lands
  // exactly when the packet reaches its stop.
  travel.eventCallback("onUpdate", () => {
    if (pin.progress <= 0 && !pin.isActive) go(-1);
    else go(indexAt(travel.progress()));
  });
  go(pin.progress > 0 || pin.isActive ? indexAt(pin.progress) : -1, true);

  // Caret blink, only while the section is on screen.
  gsap.fromTo(
    terminal,
    { "--lc-caret": 1 },
    {
      "--lc-caret": 0,
      duration: 1.1,
      ease: blink,
      repeat: -1,
      scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", toggleActions: "play pause resume pause" },
    },
  );

  // Stage entrance as it scrolls up into place, before the pin takes over.
  gsap.from(all(stage, "[data-lc-enter]"), {
    y: 32,
    opacity: 0,
    duration: DUR.slow,
    ease: EASE.out,
    stagger: 0.05,
    scrollTrigger: { trigger: stage, start: "top 75%", once: true },
  });

  return () => {
    alive = false;
    seek?.kill();
    root.setAttribute("data-lc-mode", "flow");
  };
}
