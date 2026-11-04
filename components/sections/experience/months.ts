/**
 * Month arithmetic for the experience "span strip": one shared axis that
 * covers every role, so roles that overlapped in time read as overlapping.
 * Pure functions over the "YYYY-MM" strings in lib/content.ts — no Date
 * objects, so it is safe to run while prerendering.
 */
import type { Role } from "@/lib/content";

type Span = Pick<Role, "start" | "end">;

export type MonthAxis = {
  /** Absolute month index (year × 12 + month) of the first month shown. */
  first: number;
  /** Months on the axis, both ends included. 0 when the dates don't parse. */
  count: number;
  /** End labels, exactly as written in content ("2025-10"). */
  from: string;
  to: string;
};

export function monthIndex(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
}

export function monthAxis(roles: readonly Span[]): MonthAxis {
  let first = Infinity;
  let last = -Infinity;
  let from = "";
  let to = "";
  for (const role of roles) {
    const s = monthIndex(role.start);
    const e = monthIndex(role.end);
    if (s < first) {
      first = s;
      from = role.start;
    }
    if (e > last) {
      last = e;
      to = role.end;
    }
  }
  const count = Number.isFinite(first) && Number.isFinite(last) && last >= first ? last - first + 1 : 0;
  return { first: count ? first : 0, count, from, to };
}

/** Where a role sits on the axis: offset from the first month, and length, in months. */
export function roleSpan(role: Span, axis: MonthAxis): { start: number; length: number } {
  const start = monthIndex(role.start) - axis.first;
  const length = monthIndex(role.end) - monthIndex(role.start) + 1;
  return Number.isFinite(start) && Number.isFinite(length) ? { start, length } : { start: 0, length: 0 };
}
