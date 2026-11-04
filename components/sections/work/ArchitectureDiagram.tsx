"use client";

import { useId, useMemo, useRef } from "react";
import type { ArchKind, Project } from "@/lib/content";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { layoutDiagram, type DiagramLayout, type Orientation } from "./layout";

type ArchitectureDiagramProps = {
  architecture: Project["architecture"];
  title: string;
  className?: string;
  /** start the draw-in when true; default: on scroll into view */
  play?: boolean;
  /**
   * "auto" (default) draws left → right in containers ≥ 35rem and switches to
   * a transposed top → bottom layout below that, so text stays ≥ 10px on phones.
   */
  orientation?: Orientation | "auto";
  /** Fill the parent box (e.g. a fixed-height plate) and scale to fit it. */
  fit?: boolean;
};

/** Geist cap height — centres edge-label text on its pill. */
const CAP = 0.719;

const KIND: Record<ArchKind, { box: string; label: string; sub: string; thin?: boolean; dash?: string }> = {
  client: { box: "fill-paper stroke-ink", label: "fill-ink", sub: "fill-muted" },
  edge: { box: "fill-paper stroke-line-strong", label: "fill-ink", sub: "fill-muted", thin: true },
  service: { box: "fill-ink stroke-ink", label: "fill-paper", sub: "fill-paper-dim" },
  data: { box: "fill-paper-2 stroke-line-strong", label: "fill-ink", sub: "fill-muted" },
  queue: { box: "fill-accent-soft stroke-accent", label: "fill-accent-ink", sub: "fill-accent-ink/70", thin: true },
  ai: { box: "fill-paper stroke-accent", label: "fill-accent-ink", sub: "fill-muted" },
  external: { box: "fill-paper stroke-line-strong", label: "fill-ink", sub: "fill-muted", dash: "6 5" },
  infra: { box: "fill-paper stroke-line-strong", label: "fill-ink", sub: "fill-muted", thin: true },
};

/**
 * A system drawn from data: rounded nodes styled by kind, curved edges with
 * arrowheads (dashed = async / out-of-band) and optional edge labels.
 * Motion: edges draw on, nodes pop in along the flow, then accent "request
 * packets" travel the solid edges hop by hop. Static under reduced motion
 * and without JavaScript.
 */
export default function ArchitectureDiagram({
  architecture,
  title,
  className,
  play,
  orientation = "auto",
  fit = false,
}: ArchitectureDiagramProps) {
  const root = useRef<HTMLDivElement>(null);
  const uid = `ad${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layouts = useMemo(
    () =>
      (orientation === "auto" ? (["landscape", "portrait"] as const) : [orientation]).map((o) =>
        layoutDiagram(architecture, o),
      ),
    [architecture, orientation],
  );

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const observers: IntersectionObserver[] = [];

      const timelines = gsap.utils.toArray<SVGSVGElement>("svg[data-diagram]", el).map((svg) => {
        const tl = gsap.timeline({ paused: true });

        // Edges draw on in flow order; dashed (async) edges draw through a mask
        // so they keep their dash pattern.
        const edges = gsap.utils
          .toArray<SVGGElement>("[data-edge]", svg)
          .sort((a, b) => Number(a.dataset.rank) - Number(b.dataset.rank));
        edges.forEach((g, i) => {
          const line = g.querySelector<SVGPathElement>("[data-line]");
          const arrow = g.querySelector("[data-arrow]");
          if (!line) return;
          const maskPath = g.dataset.mask ? svg.querySelector<SVGPathElement>(`#${g.dataset.mask} path`) : null;
          const target = maskPath ?? line;
          const len = Math.ceil(target.getTotalLength()) + 1;
          if (maskPath) gsap.set(line, { attr: { mask: `url(#${g.dataset.mask})` } });
          tl.fromTo(
            target,
            { strokeDasharray: `${len} ${len}`, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
            i * 0.11,
          );
          if (arrow) tl.fromTo(arrow, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none" }, i * 0.11 + 0.62);
        });

        const nodes = gsap.utils
          .toArray<SVGGElement>("[data-node]", svg)
          .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
        tl.fromTo(
          nodes,
          { opacity: 0, scale: 0.84, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, duration: 0.9, ease: EASE.out, stagger: 0.075 },
          0.45,
        );
        const labels = svg.querySelectorAll("[data-edge-label]");
        if (labels.length) tl.fromTo(labels, { opacity: 0 }, { opacity: 1, duration: 0.45, stagger: 0.06 }, ">-0.45");

        // Request packets: one per solid edge, launched hop by hop and looped.
        const packets = gsap.utils.toArray<SVGGElement>("[data-packet]", svg);
        let loop: gsap.core.Timeline | null = null;
        if (packets.length) {
          const HOP = 1.05;
          loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.7 });
          packets.forEach((p) => {
            const path = svg.querySelector<SVGPathElement>(`[data-line="${p.dataset.path}"]`);
            if (!path) return;
            const length = path.getTotalLength();
            const at = Number(p.dataset.hop) * HOP;
            const state = { t: 0 };
            loop!.fromTo(
              state,
              { t: 0 },
              {
                t: 1,
                duration: HOP,
                ease: "power1.inOut",
                onUpdate: () => {
                  const pt = path.getPointAtLength(state.t * length);
                  p.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
                },
              },
              at,
            );
            loop!.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: "none" }, at);
            loop!.to(p, { opacity: 0, duration: 0.2, ease: "none" }, at + HOP - 0.2);
          });
        }

        // Packets only run once drawn, and only while the diagram is on screen.
        let ready = false;
        let visible = false;
        const sync = () => {
          if (!loop) return;
          if (ready && visible) loop.play();
          else loop.pause();
        };
        const io = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            sync();
          },
          { rootMargin: "60px" },
        );
        io.observe(svg);
        observers.push(io);
        tl.eventCallback("onComplete", () => {
          ready = true;
          // The masks were only needed for the draw-on.
          svg.querySelectorAll("[data-line][mask]").forEach((l) => l.removeAttribute("mask"));
          sync();
        });
        return tl;
      });

      const start = () => timelines.forEach((tl) => tl.play());
      if (play === true) start();
      else if (play === undefined) ScrollTrigger.create({ trigger: el, start: "top 82%", once: true, onEnter: start });
      // play === false: hold the undrawn state until the caller flips it.

      return () => observers.forEach((io) => io.disconnect());
    },
    { scope: root, dependencies: [play, layouts], revertOnUpdate: true },
  );

  return (
    <div ref={root} className={cn("@container relative w-full", fit && "h-full", className)}>
      {layouts.map((layout) => (
        <DiagramSvg
          key={layout.orientation}
          layout={layout}
          uid={`${uid}${layout.orientation[0]}`}
          title={title}
          className={cn(
            fit ? "h-full w-full" : "h-auto w-full",
            orientation === "auto" &&
              (layout.orientation === "landscape" ? "hidden @min-[35rem]:block" : "block @min-[35rem]:hidden"),
          )}
        />
      ))}
    </div>
  );
}

function DiagramSvg({ layout, uid, title, className }: { layout: DiagramLayout; uid: string; title: string; className?: string }) {
  const { viewBox: vb, type: t, nodes, edges } = layout;
  // Draw order: solid edges by hop, async edges last.
  const rank = new Map(
    edges
      .map((e, i) => ({ i, key: e.dashed ? 1000 + i : e.hop * 50 + i }))
      .sort((a, b) => a.key - b.key)
      .map((r, k) => [r.i, k]),
  );

  return (
    <svg
      data-diagram
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${title} architecture: ${layout.summary}`}
      className={cn("block overflow-visible", className)}
    >
      <title>{`${title} — architecture`}</title>
      <defs>
        {edges.map((e, i) =>
          e.dashed ? (
            <mask key={e.key} id={`${uid}m${i}`} maskUnits="userSpaceOnUse" x={vb.x} y={vb.y} width={vb.w} height={vb.h}>
              <path d={e.d} fill="none" stroke="#fff" strokeWidth={t.stroke * 8} />
            </mask>
          ) : null,
        )}
      </defs>

      <g fill="none">
        {edges.map((e, i) => (
          <g key={e.key} data-edge data-rank={rank.get(i)} data-mask={e.dashed ? `${uid}m${i}` : undefined}>
            <path
              data-line={i}
              d={e.d}
              className={e.dashed ? "stroke-muted" : "stroke-ink"}
              strokeWidth={t.stroke}
              strokeDasharray={e.dashed ? `${t.stroke * 4} ${t.stroke * 4}` : undefined}
            />
            <path data-arrow d={e.arrow} className={e.dashed ? "fill-muted" : "fill-ink"} />
          </g>
        ))}
      </g>

      <g>
        {edges.map((e) =>
          e.label ? (
            <g key={e.key} data-edge-label>
              <rect
                x={e.label.x - e.label.w / 2}
                y={e.label.y - e.label.h / 2}
                width={e.label.w}
                height={e.label.h}
                rx={e.label.h / 2}
                className="fill-paper"
              />
              <text
                x={e.label.x}
                y={e.label.y + (CAP * t.edge) / 2}
                textAnchor="middle"
                fontSize={t.edge}
                className="fill-ink-2 font-mono"
              >
                {e.label.text}
              </text>
            </g>
          ) : null,
        )}
      </g>

      <g>
        {nodes.map((n) => {
          const k = KIND[n.kind];
          return (
            <g key={n.id} data-node data-order={n.order}>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={t.radius}
                className={k.box}
                strokeWidth={k.thin ? t.stroke * 0.8 : t.stroke}
                strokeDasharray={k.dash}
              />
              {n.kind === "data" ? (
                // Cylinder cue: the lid of a database drum.
                <path
                  d={`M${n.x} ${n.y + t.radius * 0.95}C${n.x} ${n.y + t.radius * 1.9} ${n.x + n.w} ${n.y + t.radius * 1.9} ${n.x + n.w} ${n.y + t.radius * 0.95}`}
                  fill="none"
                  className="stroke-line-strong"
                  strokeWidth={t.stroke * 0.8}
                />
              ) : null}
              {n.kind === "ai" ? (
                // Spark cue for model-backed steps.
                <path
                  d={sparkPath(n.x + n.w - t.radius * 1.15, n.y + t.radius * 1.15, t.radius * 0.5)}
                  className="fill-accent"
                />
              ) : null}
              {n.kind === "queue" ? (
                // Queue cue: stacked slots on the leading edge.
                <path
                  d={[0, 1, 2]
                    .map((s) => `M${n.x + t.radius * 0.7 + s * 4.5} ${n.cy - t.radius * 0.8}v${t.radius * 1.6}`)
                    .join("")}
                  className="stroke-accent"
                  strokeWidth={t.stroke * 0.9}
                />
              ) : null}
              {n.labelLines.map((l, i) => (
                <text
                  key={`l${i}`}
                  x={n.cx}
                  y={l.y}
                  textAnchor="middle"
                  fontSize={t.label}
                  fontWeight={500}
                  className={cn("font-sans", k.label)}
                >
                  {l.text}
                </text>
              ))}
              {n.subLines.map((l, i) => (
                <text key={`s${i}`} x={n.cx} y={l.y} textAnchor="middle" fontSize={t.sub} className={cn("font-mono", k.sub)}>
                  {l.text}
                </text>
              ))}
            </g>
          );
        })}
      </g>

      <g aria-hidden>
        {edges.map((e, i) =>
          e.dashed ? null : (
            <g key={e.key} data-packet data-path={i} data-hop={e.hop} opacity={0}>
              <circle r={t.packet * 2.2} className="fill-accent" opacity={0.16} />
              <circle r={t.packet} className="fill-accent" />
            </g>
          ),
        )}
      </g>
    </svg>
  );
}

/** Four-point star centred on (cx, cy). */
function sparkPath(cx: number, cy: number, r: number): string {
  const q = r * 0.22;
  return `M${cx} ${cy - r}Q${cx + q} ${cy - q} ${cx + r} ${cy}Q${cx + q} ${cy + q} ${cx} ${cy + r}Q${cx - q} ${cy + q} ${cx - r} ${cy}Q${cx - q} ${cy - q} ${cx} ${cy - r}Z`;
}
