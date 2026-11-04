import type { ArchKind, Project } from "@/lib/content";
import { cn } from "@/lib/cn";

type Architecture = Project["architecture"];

/** Node radius in architecture-grid units (the grid is 100 × 60). */
const R = 4.4;
/** Gap left between an edge's end and the node it touches. */
const EDGE_PAD = R + 1.8;

const r2 = (v: number) => Math.round(v * 100) / 100;

function hexagon(x: number, y: number, r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return `${r2(x + r * Math.cos(a))},${r2(y + r * Math.sin(a))}`;
  }).join(" ");
}

/** One abstract shape per architecture node kind. */
function NodeShape({ kind, x, y }: { kind: ArchKind; x: number; y: number }) {
  switch (kind) {
    case "client":
      return <circle cx={x} cy={y} r={R} />;
    case "edge":
      return <path d={`M${r2(x - R * 0.8)} ${r2(y - R)}L${r2(x + R)} ${y}L${r2(x - R * 0.8)} ${r2(y + R)}Z`} />;
    case "service":
      return <rect x={r2(x - R * 0.82)} y={r2(y - R * 0.82)} width={r2(R * 1.64)} height={r2(R * 1.64)} rx={1} />;
    case "data": {
      const h = R * 0.62;
      const ry = R * 0.36;
      return (
        <>
          <path d={`M${r2(x - R)} ${r2(y - h)}V${r2(y + h)}A${R} ${r2(ry)} 0 0 0 ${r2(x + R)} ${r2(y + h)}V${r2(y - h)}`} />
          <ellipse cx={x} cy={r2(y - h)} rx={R} ry={r2(ry)} />
        </>
      );
    }
    case "queue":
      return (
        <>
          {[-1, 0, 1].map((k) => (
            <rect key={k} x={r2(x - R)} y={r2(y + k * R * 0.74 - R * 0.24)} width={r2(R * 2)} height={r2(R * 0.48)} rx={0.3} />
          ))}
        </>
      );
    case "ai": {
      const s = R * 1.2;
      return (
        <path
          d={`M${x} ${r2(y - s)}Q${x} ${y} ${r2(x + s)} ${y}Q${x} ${y} ${x} ${r2(y + s)}Q${x} ${y} ${r2(x - s)} ${y}Q${x} ${y} ${x} ${r2(y - s)}Z`}
        />
      );
    }
    case "external":
      return <circle cx={x} cy={y} r={R} strokeDasharray="1.2 1.1" />;
    case "infra":
      return <polygon points={hexagon(x, y, R)} />;
  }
}

/**
 * A tiny, label-free drawing of a project's architecture: one shape per node
 * kind at the node's grid position, straight lines for edges (dashed when the
 * edge is async). Solid edges carry `pathLength=1` so they can be drawn on,
 * and a signal dot per edge that the preview card sends along it.
 */
export default function SystemGlyph({ architecture, className }: { architecture: Architecture; className?: string }) {
  const byId = new Map(architecture.nodes.map((n) => [n.id, n]));

  const edges = architecture.edges.flatMap((e, i) => {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) return [];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len <= EDGE_PAD * 2) return [];
    const ux = dx / len;
    const uy = dy / len;
    return [
      {
        key: `${e.from}-${e.to}-${i}`,
        dashed: Boolean(e.dashed),
        x1: r2(a.x + ux * EDGE_PAD),
        y1: r2(a.y + uy * EDGE_PAD),
        x2: r2(b.x - ux * EDGE_PAD),
        y2: r2(b.y - uy * EDGE_PAD),
      },
    ];
  });

  return (
    <svg
      viewBox="-6 -7 112 74"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      className={cn("block overflow-visible", className)}
    >
      {edges.map((e) =>
        e.dashed ? (
          <path
            key={e.key}
            data-glyph-dashed
            d={`M${e.x1} ${e.y1}L${e.x2} ${e.y2}`}
            strokeWidth={0.4}
            strokeDasharray="1.1 1.1"
            className="stroke-paper/40"
          />
        ) : (
          <path
            key={e.key}
            data-glyph-edge
            d={`M${e.x1} ${e.y1}L${e.x2} ${e.y2}`}
            pathLength={1}
            strokeDasharray="1"
            strokeWidth={0.4}
            className="stroke-paper/45"
          />
        ),
      )}
      {architecture.nodes.map((n) => (
        <g
          key={n.id}
          data-glyph-node
          strokeWidth={0.55}
          className={n.kind === "ai" ? "fill-accent stroke-accent" : "fill-ink stroke-paper"}
        >
          <NodeShape kind={n.kind} x={n.x} y={n.y} />
        </g>
      ))}
      {edges
        .filter((e) => !e.dashed)
        .map((e) => (
          <circle
            key={`${e.key}-signal`}
            data-glyph-signal
            data-x1={e.x1}
            data-y1={e.y1}
            data-x2={e.x2}
            data-y2={e.y2}
            cx={e.x1}
            cy={e.y1}
            r={0.95}
            opacity={0}
            className="fill-accent-soft"
          />
        ))}
    </svg>
  );
}
