/**
 * Pure geometry for <ArchitectureDiagram>. No DOM, no randomness and no
 * measuring: text widths come from Geist's real advance widths, so the
 * server and the client produce byte-identical SVG.
 *
 * Two orientations share one engine:
 *  - landscape: the authored 100 × 60 grid, flowing left → right;
 *  - portrait:  the same grid transposed (x ↔ y), flowing top → bottom, so a
 *    phone-width diagram keeps ≥ 10px text instead of shrinking a wide one.
 */
import type { ArchEdge, ArchKind, ArchNode } from "@/lib/content";

export type Orientation = "landscape" | "portrait";
type Side = "left" | "right" | "top" | "bottom";
type Pt = { x: number; y: number };

export type LaidOutNode = {
  id: string;
  kind: ArchKind;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  labelLines: { text: string; y: number }[];
  subLines: { text: string; y: number }[];
  /** Reveal order along the flow (0 = first). */
  order: number;
};

export type LaidOutEdge = {
  key: string;
  from: string;
  to: string;
  /** Line path; ends at the arrowhead's base. */
  d: string;
  /** Closed arrowhead path at the target. */
  arrow: string;
  dashed: boolean;
  /** Solid edges: how many hops from the entry point (sequences packets). -1 for dashed. */
  hop: number;
  label?: { text: string; x: number; y: number; w: number; h: number };
};

export type DiagramLayout = {
  orientation: Orientation;
  viewBox: { x: number; y: number; w: number; h: number };
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  /** Sizes in viewBox units, for the renderer. */
  type: { label: number; sub: number; edge: number; radius: number; stroke: number; arrow: number; packet: number };
  /** Number of solid hops in the longest request path. */
  hops: number;
  /** "React + TS → Nginx → Express API → Redis, MongoDB" (+ async edges). */
  summary: string;
};

/* ── Metrics ───────────────────────────────────────────────────────────── */

// Geist (weight 500) advance widths per 1000 em, measured from the font the
// site ships. Geist Mono is a fixed 600 per 1000 em.
const SANS_CHARS =
  "0123456789 !\"#$%&'()*+,-./:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~·—–→←↗…’×★é";
const SANS_500 = [
  673, 406, 630, 625, 629, 641, 604, 531, 624, 606, 243, 228, 361, 515, 643, 810, 649, 186, 290, 290, 427, 562, 213,
  418, 213, 494, 302, 302, 546, 544, 546, 570, 925, 689, 688, 713, 701, 609, 595, 713, 716, 280, 607, 656, 583, 890,
  745, 751, 657, 745, 680, 654, 568, 694, 688, 968, 633, 594, 561, 361, 470, 361, 438, 558, 258, 565, 608, 563, 608,
  576, 412, 607, 591, 256, 284, 609, 282, 885, 591, 588, 608, 608, 394, 537, 410, 586, 560, 829, 607, 553, 552, 395,
  274, 395, 523, 213, 908, 592, 1000, 1000, 732, 612, 218, 515, 833, 576,
];
const SANS = new Map<string, number>(Array.from(SANS_CHARS, (ch, i) => [ch, SANS_500[i]] as const));

/** Geist's cap height, used to centre a line of text on its line box. */
const CAP = 0.719;

function sansWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) w += SANS.get(ch) ?? 620;
  return (w / 1000) * size;
}

function monoWidth(text: string, size: number): number {
  return Array.from(text).length * 0.6 * size;
}

/* ── Orientation specs (all in viewBox units; the grid is scaled ×10) ──── */

type Spec = {
  label: number;
  sub: number;
  edge: number;
  padX: number;
  padY: number;
  /** Minimum clear space between side-by-side nodes. */
  minGap: number;
  /** A node wider than this is wrapped even without a neighbour. */
  maxWidth: number;
  radius: number;
  margin: number;
  stroke: number;
  arrow: number;
  packet: number;
  /** Clear space needed along the flow axis before an edge may run straight along it. */
  primaryGap: number;
  /** Same, across the flow. */
  secondaryGap: number;
  /** Minimum clear space between consecutive rows (portrait only). */
  rowGap: number;
  /** Smallest viewBox (w, h) — keeps type the same size across diagrams. */
  minCanvas: [number, number];
};

const SPECS: Record<Orientation, Spec> = {
  landscape: {
    label: 26,
    sub: 20,
    edge: 18.5,
    padX: 16,
    padY: 15,
    minGap: 50,
    maxWidth: 250,
    radius: 12,
    margin: 22,
    stroke: 1.7,
    arrow: 11.5,
    packet: 5.5,
    primaryGap: 70,
    secondaryGap: 40,
    rowGap: 0,
    minCanvas: [1100, 600],
  },
  portrait: {
    label: 29,
    sub: 22,
    edge: 21.5,
    padX: 15,
    padY: 15,
    minGap: 34,
    maxWidth: 280,
    radius: 14,
    margin: 18,
    stroke: 2,
    arrow: 13,
    packet: 6.5,
    primaryGap: 60,
    secondaryGap: 40,
    rowGap: 78,
    minCanvas: [664, 0],
  },
};

const GRID = 10;

/* ── Text wrapping ─────────────────────────────────────────────────────── */

/** Words, with separators (· + → & /) glued to the word before them. */
function tokens(text: string): string[] {
  const out: string[] = [];
  for (const t of text.split(/\s+/).filter(Boolean)) {
    if (out.length && /^[·+→&|/–—-]$/.test(t)) out[out.length - 1] += ` ${t}`;
    else out.push(t);
  }
  return out;
}

type Wrapped = { lines: string[]; width: number };

/** Balanced wrap into exactly `count` lines (minimises the widest line). */
function wrap(text: string, count: number, measure: (s: string) => number): Wrapped | null {
  if (count === 1) return { lines: [text], width: measure(text) };
  const words = tokens(text);
  if (words.length < count) return null;
  const join = (a: number, b: number) => words.slice(a, b).join(" ");
  let best: Wrapped | null = null;
  const consider = (lines: string[]) => {
    const width = Math.max(...lines.map(measure));
    if (!best || width < best.width - 0.01) best = { lines, width };
  };
  const n = words.length;
  if (count === 2) {
    for (let i = 1; i < n; i++) consider([join(0, i), join(i, n)]);
  } else {
    for (let i = 1; i < n - 1; i++) for (let j = i + 1; j < n; j++) consider([join(0, i), join(i, j), join(j, n)]);
  }
  return best;
}

type Option = { label: string[]; sub: string[]; w: number; h: number; lines: number };

function nodeHeight(labelLines: number, subLines: number, s: Spec): number {
  const content = labelLines * s.label * 1.16 + (subLines ? s.label * 0.26 + subLines * s.sub * 1.34 : 0);
  return Math.round(content + s.padY * 2);
}

function nodeOptions(node: ArchNode, s: Spec): Option[] {
  const opts: Option[] = [];
  for (const lc of [1, 2]) {
    const L = wrap(node.label, lc, (t) => sansWidth(t, s.label));
    if (!L) continue;
    for (const sc of node.sub ? [1, 2, 3] : [0]) {
      const S = sc === 0 || !node.sub ? { lines: [], width: 0 } : wrap(node.sub, sc, (t) => monoWidth(t, s.sub));
      if (!S) continue;
      opts.push({
        label: L.lines,
        sub: S.lines,
        w: Math.ceil(Math.max(L.width, S.width) + s.padX * 2),
        h: nodeHeight(lc, sc, s),
        lines: lc + sc,
      });
    }
  }
  return opts;
}

/** Fewest lines first; among equals, the widest (least wrapped) one. */
const byPreference = (a: Option, b: Option) => a.lines - b.lines || b.w - a.w;

/* ── Layout ───────────────────────────────────────────────────────────── */

type Box = { id: string; cx: number; cy: number; w: number; h: number; opt: Option; options: Option[] };

const r1 = (n: number) => Math.round(n * 10) / 10;

function overlapsVertically(a: Box, b: Box, pad = 10) {
  return Math.abs(a.cy - b.cy) < (a.h + b.h) / 2 + pad;
}

function sizeNodes(boxes: Box[], s: Spec) {
  // Start from the least-wrapped option that respects the global max width.
  for (const b of boxes) {
    const sorted = [...b.options].sort(byPreference);
    b.opt = sorted.find((o) => o.w <= s.maxWidth) ?? [...b.options].sort((x, y) => x.w - y.w)[0];
  }
  const sync = (b: Box) => {
    b.w = b.opt.w;
    b.h = b.opt.h;
  };
  boxes.forEach(sync);

  const narrower = (b: Box) => b.options.filter((o) => o.w < b.opt.w).sort(byPreference)[0];

  // Side-by-side neighbours that crowd each other get wrapped, widest first.
  for (let pass = 0; pass < 40; pass++) {
    let changed = false;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (!overlapsVertically(a, b)) continue;
        const clear = Math.abs(a.cx - b.cx) - (a.w + b.w) / 2;
        if (clear >= s.minGap) continue;
        const [wide, narrow] = a.w >= b.w ? [a, b] : [b, a];
        const viaWide = narrower(wide);
        const target = viaWide ? wide : narrow;
        const next = viaWide ?? narrower(narrow);
        if (!next) continue;
        target.opt = next;
        sync(target);
        changed = true;
      }
    }
    if (!changed) break;
  }
}

/** Portrait: push rows apart until stacked nodes leave room for an edge. */
function relaxRows(boxes: Box[], s: Spec) {
  const rowOf = new Map(boxes.map((b) => [b, b.cy]));
  const rows = [...new Set(rowOf.values())].sort((a, b) => a - b);
  const above: Box[] = [];
  let shift = 0;
  for (const r of rows) {
    const row = boxes.filter((b) => rowOf.get(b) === r);
    row.forEach((b) => (b.cy += shift));
    let need = 0;
    for (const b of row) {
      for (const p of above) {
        if (Math.abs(b.cx - p.cx) >= (b.w + p.w) / 2 + 8) continue;
        need = Math.max(need, s.rowGap - (b.cy - p.cy - (b.h + p.h) / 2));
      }
    }
    if (need > 0) {
      row.forEach((b) => (b.cy += need));
      shift += need;
    }
    above.push(...row);
  }
}

/**
 * A straight-ish edge needs room for its arrowhead and label. Where two
 * nodes sit too close for that, everything beyond the far node moves out
 * (the drawing grows; the authored arrangement is kept).
 */
function relaxAlongEdges(boxes: Box[], edges: ArchEdge[], sides: [Side, Side][], s: Spec) {
  const box = new Map(boxes.map((b) => [b.id, b]));
  const jobs = edges.map((e, i) => ({ e, sides: sides[i] })).filter(({ sides: [sa, sb] }) => horizontal(sa) === horizontal(sb));
  for (const axis of ["x", "y"] as const) {
    const along = (b: Box) => (axis === "x" ? b.cx : b.cy);
    const across = (b: Box) => (axis === "x" ? b.cy : b.cx);
    const size = (b: Box) => (axis === "x" ? b.w : b.h);
    const cross = (b: Box) => (axis === "x" ? b.h : b.w);
    const list = jobs
      .filter(({ sides: [sa] }) => horizontal(sa) === (axis === "x"))
      .map(({ e }) => {
        const a = box.get(e.from)!;
        const b = box.get(e.to)!;
        return { e, near: along(a) <= along(b) ? a : b, far: along(a) <= along(b) ? b : a };
      })
      // Diagonal S-curves have room for a label mid-way; only straight runs need space.
      .filter(({ near, far }) => Math.abs(across(near) - across(far)) < (cross(near) + cross(far)) / 2)
      .sort((p, q) => along(p.near) - along(q.near));
    for (const { e, near, far } of list) {
      const need = e.label
        ? (axis === "x" ? monoWidth(e.label, s.edge) + 16 : s.edge * 1.5) + 2 * s.arrow + (axis === "x" ? 14 : 22)
        : s.minGap;
      const clear = along(far) - size(far) / 2 - (along(near) + size(near) / 2);
      if (clear >= need) continue;
      const delta = need - clear;
      const from = along(far);
      for (const b of boxes) {
        if (along(b) < from) continue;
        if (axis === "x") b.cx += delta;
        else b.cy += delta;
      }
    }
  }
}

function chooseSides(a: Box, b: Box, o: Orientation, s: Spec): [Side, Side] {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const gapX = Math.abs(dx) - (a.w + b.w) / 2;
  const gapY = Math.abs(dy) - (a.h + b.h) / 2;
  const H: [Side, Side] = dx >= 0 ? ["right", "left"] : ["left", "right"];
  const V: [Side, Side] = dy >= 0 ? ["bottom", "top"] : ["top", "bottom"];
  if (o === "landscape") {
    if (gapX >= s.primaryGap) return H;
    if (gapY >= s.secondaryGap) return Math.abs(dx) <= (a.w + b.w) / 4 ? V : [H[0], V[1]];
    return H;
  }
  if (gapY >= s.primaryGap) return V;
  if (gapX >= s.secondaryGap) return Math.abs(dy) <= (a.h + b.h) / 4 ? H : [V[0], H[1]];
  return V;
}

const NORMAL: Record<Side, Pt> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, top: { x: 0, y: -1 }, bottom: { x: 0, y: 1 } };
const horizontal = (side: Side) => side === "left" || side === "right";

function port(b: Box, side: Side, offset: number): Pt {
  switch (side) {
    case "left":
      return { x: b.cx - b.w / 2, y: b.cy + offset };
    case "right":
      return { x: b.cx + b.w / 2, y: b.cy + offset };
    case "top":
      return { x: b.cx + offset, y: b.cy - b.h / 2 };
    default:
      return { x: b.cx + offset, y: b.cy + b.h / 2 };
  }
}

function bezier(p0: Pt, c1: Pt, c2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * c1.x + c * c2.x + d * p3.x, y: a * p0.y + b * c1.y + c * c2.y + d * p3.y };
}

type Rect = { x: number; y: number; w: number; h: number };
function overlapArea(a: Rect, b: Rect): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

export function layoutDiagram(architecture: { nodes: ArchNode[]; edges: ArchEdge[] }, orientation: Orientation): DiagramLayout {
  const s = SPECS[orientation];
  const { nodes, edges } = architecture;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const validEdges = edges.filter((e) => byId.has(e.from) && byId.has(e.to) && e.from !== e.to);

  // 1 · Boxes on the (possibly transposed) grid.
  const boxes: Box[] = nodes.map((n) => {
    const options = nodeOptions(n, s);
    const opt = options[0];
    return {
      id: n.id,
      cx: (orientation === "landscape" ? n.x : n.y) * GRID,
      cy: (orientation === "landscape" ? n.y : n.x) * GRID,
      w: opt.w,
      h: opt.h,
      opt,
      options,
    };
  });
  sizeNodes(boxes, s);
  if (orientation === "portrait") relaxRows(boxes, s);
  const box = new Map(boxes.map((b) => [b.id, b]));

  // 2 · Flow depth along solid edges (longest path; capped so cycles can't loop).
  const depth = new Map(nodes.map((n) => [n.id, 0]));
  const solid = validEdges.filter((e) => !e.dashed);
  for (let i = 0; i < nodes.length; i++) {
    for (const e of solid) depth.set(e.to, Math.max(depth.get(e.to)!, Math.min(depth.get(e.from)! + 1, nodes.length)));
  }

  // 3 · Ports: pick sides (after making room for labels), then fan out
  //     edges that share a side.
  const pickSides = () => validEdges.map((e) => chooseSides(box.get(e.from)!, box.get(e.to)!, orientation, s));
  relaxAlongEdges(boxes, validEdges, pickSides(), s);
  const sides = pickSides();
  const groups = new Map<string, { edge: number; end: 0 | 1; other: Box }[]>();
  validEdges.forEach((e, i) => {
    const ends: [string, Side, Box][] = [
      [e.from, sides[i][0], box.get(e.to)!],
      [e.to, sides[i][1], box.get(e.from)!],
    ];
    ends.forEach(([id, side, other], end) => {
      const key = `${id}:${side}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({ edge: i, end: end as 0 | 1, other });
    });
  });
  const offsets = validEdges.map(() => [0, 0]);
  for (const [key, list] of groups) {
    const [id, side] = key.split(":") as [string, Side];
    const b = box.get(id)!;
    const along = horizontal(side) ? (o: Box) => o.cy : (o: Box) => o.cx;
    list.sort((p, q) => along(p.other) - along(q.other));
    const length = horizontal(side) ? b.h : b.w;
    const step = list.length > 1 ? Math.min(orientation === "landscape" ? 14 : 18, (length - 2 * s.radius - 8) / (list.length - 1)) : 0;
    list.forEach((p, k) => (offsets[p.edge][p.end] = (k - (list.length - 1) / 2) * step));
  }

  // 4 · Paths, arrowheads, labels.
  const nodeRects: Rect[] = boxes.map((b) => ({ x: b.cx - b.w / 2 - 6, y: b.cy - b.h / 2 - 6, w: b.w + 12, h: b.h + 12 }));
  const placed: Rect[] = [];
  const extents: Pt[] = [];

  const laidEdges: LaidOutEdge[] = validEdges.map((e, i) => {
    const a = box.get(e.from)!;
    const b = box.get(e.to)!;
    const [sa, sb] = sides[i];
    const n0 = NORMAL[sa];
    const n3 = NORMAL[sb];
    const p0raw = port(a, sa, offsets[i][0]);
    const p3raw = port(b, sb, offsets[i][1]);
    const start = { x: p0raw.x + n0.x * 3, y: p0raw.y + n0.y * 3 };
    const tip = { x: p3raw.x + n3.x * 2.5, y: p3raw.y + n3.y * 2.5 };
    const end = { x: tip.x + n3.x * (s.arrow - 1.5), y: tip.y + n3.y * (s.arrow - 1.5) };

    const sameAxis = horizontal(sa) === horizontal(sb);
    const d0 = horizontal(sa) ? Math.abs(end.x - start.x) : Math.abs(end.y - start.y);
    const d3 = horizontal(sb) ? Math.abs(end.x - start.x) : Math.abs(end.y - start.y);
    const k0 = sameAxis ? Math.max(28, d0 * 0.5) : Math.max(20, d0 * 0.62);
    const k3 = sameAxis ? Math.max(28, d3 * 0.5) : Math.max(20, d3 * 0.62);
    const c1 = { x: start.x + n0.x * k0, y: start.y + n0.y * k0 };
    const c2 = { x: end.x + n3.x * k3, y: end.y + n3.y * k3 };

    const base = { x: tip.x + n3.x * s.arrow, y: tip.y + n3.y * s.arrow };
    const perp = { x: -n3.y, y: n3.x };
    const half = s.arrow * 0.5;
    const arrow = `M${r1(base.x + perp.x * half)} ${r1(base.y + perp.y * half)}L${r1(tip.x)} ${r1(tip.y)}L${r1(base.x - perp.x * half)} ${r1(base.y - perp.y * half)}Z`;

    for (let t = 0; t <= 1; t += 1 / 12) extents.push(bezier(start, c1, c2, end, t));

    let label: LaidOutEdge["label"];
    if (e.label) {
      const w = monoWidth(e.label, s.edge) + 16;
      const h = s.edge * 1.5;
      let best: { pt: Pt; cost: number } | null = null;
      for (const t of [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74]) {
        const pt = bezier(start, c1, c2, end, t);
        const rect = { x: pt.x - w / 2, y: pt.y - h / 2, w, h };
        const cost =
          nodeRects.reduce((sum, r) => sum + overlapArea(rect, r), 0) +
          placed.reduce((sum, r) => sum + overlapArea(rect, { x: r.x - 4, y: r.y - 4, w: r.w + 8, h: r.h + 8 }), 0);
        if (!best || cost < best.cost - 0.5) best = { pt, cost };
        if (cost === 0) break;
      }
      const pt = best!.pt;
      label = { text: e.label, x: r1(pt.x), y: r1(pt.y), w: r1(w), h: r1(h) };
      placed.push({ x: pt.x - w / 2, y: pt.y - h / 2, w, h });
    }

    return {
      key: `${e.from}-${e.to}-${i}`,
      from: e.from,
      to: e.to,
      d: `M${r1(start.x)} ${r1(start.y)}C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(end.x)} ${r1(end.y)}`,
      arrow,
      dashed: Boolean(e.dashed),
      hop: e.dashed ? -1 : depth.get(e.from)!,
      label,
    };
  });

  // 5 · Nodes with text baselines.
  const flowKey = (b: Box) => (orientation === "landscape" ? b.cx * 1000 + b.cy : b.cy * 1000 + b.cx);
  const order = [...boxes].sort((p, q) => flowKey(p) - flowKey(q)).map((b) => b.id);
  const laidNodes: LaidOutNode[] = boxes.map((b) => {
    const { label, sub } = b.opt;
    const lh = s.label * 1.16;
    const sh = s.sub * 1.34;
    const gap = sub.length ? s.label * 0.26 : 0;
    const content = label.length * lh + gap + sub.length * sh;
    const top = b.cy - content / 2;
    return {
      id: b.id,
      kind: byId.get(b.id)!.kind,
      x: r1(b.cx - b.w / 2),
      y: r1(b.cy - b.h / 2),
      w: b.w,
      h: b.h,
      cx: r1(b.cx),
      cy: r1(b.cy),
      labelLines: label.map((text, k) => ({ text, y: r1(top + k * lh + lh / 2 + (CAP * s.label) / 2) })),
      subLines: sub.map((text, k) => ({
        text,
        y: r1(top + label.length * lh + gap + k * sh + sh / 2 + (CAP * s.sub) / 2),
      })),
      order: order.indexOf(b.id),
    };
  });

  // 6 · viewBox around everything, with a margin.
  const xs = [
    ...boxes.flatMap((b) => [b.cx - b.w / 2, b.cx + b.w / 2]),
    ...placed.flatMap((r) => [r.x, r.x + r.w]),
    ...extents.map((p) => p.x),
  ];
  const ys = [
    ...boxes.flatMap((b) => [b.cy - b.h / 2, b.cy + b.h / 2]),
    ...placed.flatMap((r) => [r.y, r.y + r.h]),
    ...extents.map((p) => p.y),
  ];
  // Every diagram of an orientation gets at least the same canvas, so text
  // renders at one size across a set of panels; content stays centred.
  const minX = Math.min(...xs) - s.margin;
  const minY = Math.min(...ys) - s.margin;
  const maxX = Math.max(...xs) + s.margin;
  const maxY = Math.max(...ys) + s.margin;
  const w = Math.max(maxX - minX, s.minCanvas[0]);
  const h = Math.max(maxY - minY, s.minCanvas[1]);
  const viewBox = {
    x: Math.floor((minX + maxX) / 2 - w / 2),
    y: Math.floor((minY + maxY) / 2 - h / 2),
    w: Math.ceil(w),
    h: Math.ceil(h),
  };

  // 7 · Accessible summary: solid-edge layers, then the async edges.
  const labelOf = (id: string) => byId.get(id)!.label;
  const inFlow = new Set(solid.flatMap((e) => [e.from, e.to]));
  const layers: string[][] = [];
  for (const id of order) {
    if (!inFlow.has(id)) continue;
    const dpt = depth.get(id)!;
    (layers[dpt] ??= []).push(labelOf(id));
  }
  const chain = layers.filter(Boolean).map((l) => l.join(", ")).join(" → ");
  const async = validEdges
    .filter((e) => e.dashed)
    .map((e) => `${labelOf(e.from)} → ${labelOf(e.to)}${e.label ? ` (${e.label})` : ""}`);
  const summary = [chain, async.length ? `async: ${async.join("; ")}` : ""].filter(Boolean).join(". ");

  return {
    orientation,
    viewBox,
    nodes: laidNodes,
    edges: laidEdges,
    type: { label: s.label, sub: s.sub, edge: s.edge, radius: s.radius, stroke: s.stroke, arrow: s.arrow, packet: s.packet },
    hops: Math.max(0, ...laidEdges.map((e) => e.hop + 1)),
    summary,
  };
}
