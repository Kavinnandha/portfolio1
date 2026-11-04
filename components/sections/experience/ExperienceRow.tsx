import type { Role } from "@/lib/content";
import { cn } from "@/lib/cn";
import MonthStrip from "./MonthStrip";
import { roleSpan, type MonthAxis } from "./months";

type ExperienceRowProps = {
  role: Role;
  /** Spec-style number shown in the meta column, e.g. "03.1". */
  number: string;
  axis: MonthAxis;
  /** The lead role: larger type, an ink rule, an accent span strip. */
  featured?: boolean;
};

/**
 * One role as an editorial row on the 12-column grid:
 *   meta (number, period, kind, month strip) · company + title · summary, points, stack.
 * md: meta sticks beside the stacked content. lg: meta and title both stick
 * while the longer right column scrolls past.
 *
 * The data-exp-* hooks are read by ./motion.ts; nothing here is hidden by
 * CSS, so the row is complete without JavaScript.
 */
export default function ExperienceRow({ role, number, axis, featured = false }: ExperienceRowProps) {
  const span = roleSpan(role, axis);

  return (
    <li
      data-exp-row
      className={cn(
        "group/row relative isolate",
        featured ? "pt-10 pb-16 md:pt-14 md:pb-24 lg:pb-28" : "pt-10 pb-14 md:pt-14 md:pb-20",
      )}
    >
      {/* Desktop hover: a faint full-bleed paper band behind the row, and an
          accent rule that runs out along the hairline. Decoration only. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 inset-x-[calc(50%-50vw)] -z-10 bg-paper-2 opacity-0 transition-opacity duration-700 ease-out-quart group-hover/row:opacity-70"
      />
      <span
        aria-hidden
        data-exp-line
        className={cn("absolute inset-x-0 top-0 h-px", featured ? "bg-ink" : "bg-line-strong")}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-[900ms] ease-out-expo group-hover/row:scale-x-100"
      />

      <div className="grid grid-cols-12 gap-x-6 gap-y-8 md:gap-y-12">
        {/* Meta */}
        <div className="col-span-12 md:sticky md:top-28 md:col-span-4 md:row-span-2 md:self-start lg:col-span-3 lg:row-span-1">
          <p data-exp-meta className="label text-ink transition-colors duration-500 group-hover/row:text-accent">
            {number}
          </p>
          <p data-exp-meta className="mt-5 font-mono text-[0.8125rem] leading-snug tracking-[-0.01em] text-ink">
            {role.period}
          </p>
          <p data-exp-meta className="label mt-2 text-muted">
            {role.kind}
          </p>
          <div data-exp-meta className="mt-6">
            <MonthStrip axis={axis} start={span.start} length={span.length} featured={featured} />
          </div>
        </div>

        {/* Company + title */}
        <div className="col-span-12 md:col-span-8 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <h3
            data-exp-company
            className={cn(
              "font-medium text-ink",
              featured
                ? "text-[length:clamp(2.25rem,4.6vw,4.75rem)] leading-[0.95] tracking-[-0.045em]"
                : "text-title",
            )}
          >
            {role.company}
          </h3>
          <p
            data-exp-role
            className={cn(
              "font-serif font-normal text-ink-2 italic",
              featured
                ? "mt-4 text-[length:clamp(1.5rem,2.3vw,2.375rem)] leading-[1.05] tracking-[-0.015em] md:mt-5"
                : "mt-3 text-[length:clamp(1.25rem,1.7vw,1.75rem)] leading-[1.1] tracking-[-0.01em]",
            )}
          >
            {role.title}
          </p>
        </div>

        {/* Summary, points, stack */}
        <div className="col-span-12 md:col-span-8 md:col-start-5 lg:col-span-5 lg:col-start-auto">
          <p
            data-exp-summary
            className={cn("text-ink", featured ? "text-lede" : "text-[1.0625rem] leading-[1.5] md:text-lg")}
          >
            {role.summary}
          </p>

          <ul role="list" data-exp-points className="mt-8 space-y-3 md:mt-10">
            {role.points.map((point) => (
              <li
                key={point}
                data-exp-point
                className="relative pl-7 text-[0.975rem] leading-[1.55] text-ink-2 md:text-base"
              >
                <span aria-hidden data-exp-marker className="absolute top-[0.775em] left-0 h-[1.5px] w-3.5 bg-accent" />
                {point}
              </li>
            ))}
          </ul>

          <ul role="list" data-exp-stack className="mt-8 flex flex-wrap gap-2 md:mt-10">
            {role.stack.map((tech) => (
              <li
                key={tech}
                data-exp-chip
                className="rounded-full border border-line-strong px-3 py-1.5 font-mono text-[0.6875rem] leading-none tracking-[0.06em] text-ink-2 uppercase"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
