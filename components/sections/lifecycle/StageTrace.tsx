import type { CSSProperties } from "react";
import { lifecycle, sections } from "@/lib/content";
import { cn } from "@/lib/cn";

/** Carets blink through one CSS variable on the terminal (see motion.ts). */
const caretStyle: CSSProperties = { opacity: "var(--lc-caret, 1)" };

function TermLine({ prefix, text, response = false }: { prefix: string; text: string; response?: boolean }) {
  return (
    <div data-lc-line className={cn("flex overflow-hidden whitespace-pre", response ? "text-accent-soft" : "text-paper")}>
      <span className="w-[3.5ch] shrink-0 text-paper-dim">{prefix}</span>
      <span data-lc-type data-chars={Array.from(text).length} className="block shrink-0 overflow-hidden">
        {text}
      </span>
      <span data-lc-caret className="ml-[0.15ch] block h-[1.2em] w-[0.6ch] shrink-0 self-center bg-paper/80" style={caretStyle} />
    </div>
  );
}

/**
 * The pinned desktop stage (≥1024 × 700, motion allowed). Left: the eight
 * layers on a rail that a request packet travels down. Right: the active
 * layer's body in large type over a terminal that prints the request log.
 * aria-hidden — the same content is read from FlowTrace.
 */
export default function StageTrace() {
  const { steps, response } = lifecycle;
  const total = String(steps.length).padStart(2, "0");

  return (
    <div data-lc-stage aria-hidden className="hidden h-svh bg-paper-2 group-data-[lc-mode=pinned]/lc:block">
      <div className="container-site flex h-full flex-col pt-[clamp(5.5rem,13vh,8rem)] pb-[clamp(1.75rem,5vh,3.5rem)]">
        <div data-lc-enter className="label flex items-center justify-between gap-6 border-b border-line pb-4 text-muted">
          <span className="flex items-center gap-3">
            <span className="text-ink">({sections.approach.index})</span>
            <span>{sections.approach.label}</span>
          </span>
          <span className="flex items-center gap-2 tabular-nums">
            <span className="relative block h-[1.25em] overflow-hidden text-ink">
              <span data-lc-counter className="block">
                {steps.map((s) => (
                  <span key={s.index} className="block h-[1.25em]">
                    {s.index}
                  </span>
                ))}
              </span>
            </span>
            <span>/ {total}</span>
          </span>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-x-6 pt-[clamp(1.5rem,4vh,3rem)] xl:gap-x-10">
          {/* Pipeline */}
          <div className="relative col-span-5 flex min-h-0 flex-col xl:col-span-4">
            {/* Track spans first → last stop centre (8 equal rows: 6.25% in from each end). */}
            <div data-lc-track className="pointer-events-none absolute top-[6.25%] bottom-[6.25%] left-[7.5px] w-0">
              <span className="absolute inset-y-0 -left-[0.5px] w-px bg-line-strong" />
              <span data-lc-fill className="absolute inset-y-0 -left-px w-[2px] bg-accent" />
              <span data-lc-mover className="absolute top-0 left-0 h-full w-0">
                <span data-lc-packet className="absolute -bottom-[7px] -left-[7px] size-[14px]">
                  <span data-lc-pulse className="absolute inset-0 rounded-full bg-accent" />
                  <span className="absolute inset-0 rounded-full bg-accent shadow-[0_0_0_5px_rgb(43_68_255/0.16)]" />
                </span>
              </span>
              <span data-lc-return className="absolute top-0 left-0 h-full w-0">
                <span
                  data-lc-return-packet
                  className="absolute -bottom-[7px] -left-[7px] size-[14px] rounded-full border-2 border-accent bg-paper-2"
                />
              </span>
            </div>

            <ol className="relative flex min-h-0 flex-1 flex-col">
              {steps.map((s) => (
                <li key={s.index} data-lc-enter className="flex min-h-0 flex-1 items-center gap-4">
                  <span className="relative size-[15px] shrink-0">
                    <span className="absolute inset-[2px] rounded-full border border-line-strong bg-paper-2" />
                    <span data-lc-lit className="absolute inset-[2px] rounded-full bg-accent" />
                  </span>
                  <span data-lc-text className="min-w-0">
                    <span className="flex items-baseline gap-3">
                      <span className="label text-muted">{s.index}</span>
                      <span className="text-[clamp(1.05rem,min(1.75vw,3vh),1.75rem)] leading-[1.1] font-medium tracking-[-0.02em] text-ink">
                        {s.layer}
                      </span>
                    </span>
                    <span className="label mt-1 block text-muted">{s.tech}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Active layer + request log */}
          <div className="col-span-6 col-start-7 flex min-h-0 flex-col xl:col-span-7 xl:col-start-6">
            <div data-lc-enter className="grid min-h-0 flex-1 content-center">
              {steps.map((s) => (
                <div key={s.index} data-lc-body className="col-start-1 row-start-1">
                  <p className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                    <span className="text-accent">{s.index}</span>
                    <span className="text-ink">{s.layer}</span>
                    <span>{s.tech}</span>
                  </p>
                  <p className="mt-5 text-[clamp(1.5rem,min(2.5vw,4.4vh),2.75rem)] leading-[1.12] font-medium tracking-[-0.03em] text-pretty text-ink">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            <div
              data-lc-enter
              data-lc-terminal
              className="mt-[clamp(1.25rem,3vh,2rem)] overflow-hidden rounded-xl bg-ink text-paper shadow-[0_30px_60px_-35px_rgb(15_15_14/0.6)]"
            >
              <div className="flex items-center justify-between gap-6 border-b border-line-inverse px-4 py-3">
                <span className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-paper/20" />
                  <span className="size-2.5 rounded-full bg-paper/20" />
                  <span className="size-2.5 rounded-full bg-paper/20" />
                </span>
                <span className="label truncate text-paper-dim">{sections.approach.meta}</span>
              </div>
              <div className="px-4 py-3.5 font-mono text-[clamp(0.72rem,0.55rem+0.3vw,0.875rem)] leading-[1.75]">
                {steps.map((s) => (
                  <TermLine key={s.index} prefix={s.index} text={s.log} />
                ))}
                <TermLine prefix="" text={response} response />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
