import type { Project } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ArrowUpRight } from "@/components/ui/Icons";
import ArchitectureDiagram from "./ArchitectureDiagram";
import { workCopy } from "./copy";

type ProjectPanelProps = {
  project: Project;
  /** Inside the pinned horizontal track: fixed height, two columns, fluid type. */
  pinned: boolean;
  /** Forwarded to the diagram (undefined = it plays itself on scroll-in). */
  play?: boolean;
};

const LINK_KEYS = ["github", "paper", "live"] as const;

/** One featured project: header, write-up, and its architecture as the visual. */
export default function ProjectPanel({ project: p, pinned, play }: ProjectPanelProps) {
  const titleId = `work-${p.slug}`;
  const hasAsync = p.architecture.edges.some((e) => e.dashed);
  const links = LINK_KEYS.flatMap((key) => {
    const href = p.links[key];
    return href ? [{ key, href, ...workCopy.links[key] }] : [];
  });

  return (
    <li
      data-panel
      className={cn(
        "relative",
        pinned
          ? "flex h-full w-[var(--panel-w)] shrink-0 flex-col before:absolute before:inset-y-0 before:left-[calc(var(--panel-gap)/-2)] before:w-px before:bg-line first:before:hidden"
          : "border-t border-line pt-8 pb-16 first:border-t-0 first:pt-0 last:pb-0 md:pt-10 md:pb-24",
      )}
    >
      <article
        aria-labelledby={titleId}
        className={cn("flex flex-col", pinned && "h-full min-h-0 justify-center-safe")}
      >
        <div
          data-reveal
          className="label flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-4 text-muted"
        >
          <span className="flex items-center gap-3">
            <span className="text-ink">({p.index})</span>
            <span>{p.kicker}</span>
          </span>
          {p.year ? <span className="tabular-nums">{p.year}</span> : null}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-end justify-between gap-x-8 gap-y-4",
            pinned ? "mt-[clamp(1rem,2.6vh,1.75rem)]" : "mt-6 md:mt-8",
          )}
        >
          <h3
            id={titleId}
            data-title
            className={cn(
              "font-medium text-ink",
              // Pinned panels share one viewport with the diagram: a slightly
              // smaller title keeps long names on one line so the panel fits.
              pinned ? "text-[clamp(2rem,3.6vw,3.75rem)] leading-[0.98] tracking-[-0.042em]" : "text-headline",
            )}
          >
            {p.title}
          </h3>
          {p.award ? (
            <p
              data-reveal
              className="label inline-flex max-w-full items-start gap-2 rounded-[1rem] bg-accent px-3.5 py-2 leading-snug text-white"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden focusable={false} fill="currentColor" className="mt-px shrink-0">
                <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" />
              </svg>
              <span>{p.award}</span>
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "grid",
            pinned
              ? "mt-[clamp(1.25rem,3.4vh,2.5rem)] min-h-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] grid-rows-[auto_auto_1fr] gap-x-[clamp(2rem,4vw,4.5rem)] gap-y-[clamp(0.75rem,2vh,1.5rem)]"
              : "mt-8 gap-y-8 md:mt-10 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] xl:grid-rows-[auto_auto_1fr] xl:gap-x-16 xl:gap-y-6",
          )}
        >
          <p
            data-reveal
            className={cn(
              "text-ink-2",
              pinned
                ? "col-start-1 row-start-1 text-[clamp(0.875rem,0.36rem+1.25vh,1.0625rem)] leading-[1.5]"
                : "max-w-[60ch] text-[1.0625rem] leading-[1.55] md:text-[1.1875rem] xl:col-start-1 xl:row-start-1 xl:text-[1.0625rem]",
            )}
          >
            {p.description}
          </p>

          <figure
            className={cn(
              pinned ? "col-start-2 row-span-3 row-start-1 flex min-h-0 flex-col" : "xl:col-start-2 xl:row-span-3 xl:row-start-1",
            )}
          >
            <figcaption data-reveal className="label mb-3 flex items-center justify-between gap-4 text-muted">
              <span>
                Fig. {p.index} — {workCopy.figure}
              </span>
              <span aria-hidden className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="h-px w-5 bg-ink" />
                  {workCopy.legend.sync}
                </span>
                {hasAsync ? (
                  <span className="flex items-center gap-2">
                    <span className="h-px w-5 bg-[repeating-linear-gradient(90deg,var(--color-muted)_0_3px,transparent_3px_6px)]" />
                    {workCopy.legend.async}
                  </span>
                ) : null}
              </span>
            </figcaption>

            <div
              data-plate
              className={cn(
                "relative overflow-hidden rounded-[1.25rem] border border-line bg-paper bg-[radial-gradient(circle,var(--color-line)_1px,transparent_1.5px)] bg-[length:22px_22px]",
                pinned ? "aspect-[11/6] min-h-0 w-full" : "p-1.5 sm:p-4",
              )}
            >
              <span
                data-numeral
                aria-hidden
                className="pointer-events-none absolute right-[0.08em] bottom-[-0.14em] select-none text-[clamp(5rem,11vw,11rem)] leading-none font-medium tracking-[-0.06em] text-paper-3"
              >
                {p.index}
              </span>
              <div className={pinned ? "absolute inset-3" : "relative"}>
                <ArchitectureDiagram
                  architecture={p.architecture}
                  title={p.title}
                  play={play}
                  orientation={pinned ? "landscape" : "auto"}
                  fit={pinned}
                />
              </div>
            </div>

            <div
              data-reveal
              className={cn(
                "grid gap-x-6 gap-y-3 border-t border-line",
                p.metric && "sm:grid-cols-[auto_minmax(0,1fr)]",
                pinned ? "mt-[clamp(0.75rem,1.6vh,1rem)] pt-[clamp(0.75rem,1.6vh,1rem)]" : "mt-4 pt-4",
              )}
            >
              {p.metric ? (
                <div>
                  <p className="text-[clamp(1.75rem,2.6vw,2.75rem)] leading-none font-medium tracking-[-0.045em] text-ink tabular-nums">
                    {p.metric.value}
                  </p>
                  <p className="label mt-2 max-w-[24ch] text-muted">{p.metric.label}</p>
                </div>
              ) : null}
              <ul aria-label={workCopy.stack} className="flex flex-wrap content-start gap-1.5">
                {p.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-line-strong px-2.5 py-1 font-mono text-[0.6875rem] leading-tight text-ink-2"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </figure>

          <ul
            data-reveal
            className={cn(
              "border-t border-line text-ink-2",
              pinned
                ? "col-start-1 row-start-2 space-y-[clamp(0.25rem,0.8vh,0.5rem)] pt-[clamp(0.75rem,1.6vh,1rem)] text-[clamp(0.8125rem,0.3rem+1.15vh,0.9375rem)] leading-[1.45]"
                : "max-w-[60ch] space-y-2.5 pt-5 text-[0.9375rem] leading-[1.5] md:text-base xl:col-start-1 xl:row-start-2",
            )}
          >
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-3">
                <span aria-hidden className="mt-[0.72em] h-px w-3 shrink-0 bg-ink" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {links.length ? (
            <ul
              data-reveal
              className={cn(
                "flex flex-wrap items-start gap-x-7 gap-y-3 self-start",
                pinned ? "col-start-1 row-start-3" : "xl:col-start-1 xl:row-start-3",
              )}
            >
              {links.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="view"
                    data-cursor-label={l.cursor}
                    className="label relative inline-flex items-center gap-1.5 bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-[position:100%_100%] bg-no-repeat pb-1 text-ink transition-[background-size,color] duration-500 ease-out-expo after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:bg-[length:0%_1px] hover:bg-[position:0%_100%] hover:text-accent focus-visible:bg-[length:0%_1px]"
                  >
                    {l.label}
                    <ArrowUpRight size={14} />
                    <span className="sr-only"> {workCopy.newTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </li>
  );
}
