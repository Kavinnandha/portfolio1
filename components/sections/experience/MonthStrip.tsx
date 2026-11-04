import { cn } from "@/lib/cn";
import type { MonthAxis } from "./months";

type MonthStripProps = {
  axis: MonthAxis;
  /** Offset of the role's first month on the axis. */
  start: number;
  /** Months the role lasted. */
  length: number;
  featured?: boolean;
  className?: string;
};

/**
 * A tiny Gantt strip: one cell per month on the shared axis, filled where
 * this role was running. Decorative — the period text beside it says the
 * same thing in words — so it is hidden from assistive tech. Falls back to
 * a continuous bar if the axis ever grows past two years.
 */
export default function MonthStrip({ axis, start, length, featured = false, className }: MonthStripProps) {
  if (axis.count < 1) return null;
  const end = start + length;
  const filled = featured ? "bg-accent" : "bg-ink";

  return (
    <div aria-hidden className={cn("w-full max-w-[15rem]", className)}>
      {axis.count <= 24 ? (
        <div className="flex gap-[3px]">
          {Array.from({ length: axis.count }, (_, i) => (
            <span
              key={i}
              data-exp-cell
              className={cn("h-1.5 flex-1 rounded-[1px]", i >= start && i < end ? filled : "bg-line")}
            />
          ))}
        </div>
      ) : (
        <div className="relative h-1.5 overflow-hidden rounded-[1px] bg-line">
          <span
            data-exp-cell
            className={cn("absolute inset-y-0", filled)}
            style={{ left: `${(start / axis.count) * 100}%`, width: `${(length / axis.count) * 100}%` }}
          />
        </div>
      )}
      <div className="mt-2.5 flex justify-between font-mono text-[0.625rem] leading-none tracking-[0.06em] text-muted">
        <span>{axis.from}</span>
        <span>{axis.to}</span>
      </div>
    </div>
  );
}
