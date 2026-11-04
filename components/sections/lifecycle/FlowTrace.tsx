import { lifecycle } from "@/lib/content";

function Dot() {
  return (
    <span
      aria-hidden
      className="relative mt-[0.55rem] size-3 justify-self-center rounded-full border border-line-strong bg-paper-2 lg:mt-[0.7rem]"
    >
      <span data-lc-flow-dot className="absolute -inset-px rounded-full bg-accent" />
    </span>
  );
}

/**
 * The canonical, linear version of the request trace: every layer with its
 * body and log line inline, joined by a rail. It is what phones, reduced
 * motion and no-JS visitors see; in pinned mode it stays in the accessibility
 * tree (visually hidden) while the aria-hidden stage takes over visually.
 */
export default function FlowTrace() {
  const { steps, response } = lifecycle;

  return (
    <div data-lc-flow className="container-site group-data-[lc-mode=pinned]/lc:sr-only">
      <div data-lc-flow-list className="relative">
        <span aria-hidden className="pointer-events-none absolute top-3 bottom-3 left-[calc(0.5rem-0.5px)] w-px bg-line-strong" />
        <span
          aria-hidden
          data-lc-flow-fill
          className="pointer-events-none absolute top-3 bottom-3 left-[calc(0.5rem-1px)] w-[2px] bg-accent"
        />

        <ol className="relative">
          {steps.map((step) => (
            <li
              key={step.index}
              data-lc-flow-step
              className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-5 pb-12 md:gap-x-8 md:pb-16"
            >
              <Dot />
              <div className="grid gap-y-4 lg:grid-cols-12 lg:gap-x-6">
                <div data-lc-flow-item className="lg:col-span-4">
                  <div className="flex items-baseline gap-3">
                    <span aria-hidden className="label text-muted">
                      {step.index}
                    </span>
                    <h3 className="text-[clamp(1.5rem,2.3vw,2.125rem)] leading-[1.05] font-medium tracking-[-0.03em] text-ink">
                      {step.layer}
                    </h3>
                  </div>
                  <p className="label mt-2.5 text-muted">{step.tech}</p>
                </div>
                <p
                  data-lc-flow-item
                  className="max-w-[52ch] text-[1.0625rem] leading-[1.55] text-pretty text-ink-2 lg:col-span-5 lg:text-[1.125rem]"
                >
                  {step.body}
                </p>
                <div data-lc-flow-item className="lg:col-span-3">
                  <samp className="block rounded-lg bg-ink px-3.5 py-3 font-mono text-[0.75rem] leading-[1.6] whitespace-pre-wrap text-paper [overflow-wrap:anywhere]">
                    {step.log}
                  </samp>
                </div>
              </div>
            </li>
          ))}

          <li data-lc-flow-step className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-5 md:gap-x-8">
            <Dot />
            <p data-lc-flow-item className="font-mono text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.4] text-ink">
              <samp>{response}</samp>
              <span
                aria-hidden
                data-lc-flow-caret
                className="ml-1.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.16em] bg-accent"
              />
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}
