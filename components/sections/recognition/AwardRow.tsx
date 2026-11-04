import type { Award } from "@/lib/content";
import { cn } from "@/lib/cn";
import RollText from "@/components/ui/RollText";

/** A result counts as a win when it names one ("Winner", "… Track Winner"). */
const isWin = (result: string) => /\bwinner\b/i.test(result);

/**
 * One award as a big list row: year · title · result · detail.
 * Desktop hover (Tailwind's hover variants only apply on hover-capable
 * pointers): an ink fill wipes up from the bottom, the text flips to paper
 * and the title rolls. The row is not a link and shows no pointer — the
 * flourish adds no information, so touch users miss nothing.
 */
export default function AwardRow({ award }: { award: Award }) {
  const win = award.highlight || isWin(award.result);
  const flip = "transition-colors duration-500 ease-out-quart";

  return (
    <li data-award-row className="group relative isolate">
      <span aria-hidden data-award-line className="absolute inset-x-0 top-0 h-px bg-line-strong" />
      {/* Full-bleed ink fill (the list is centred, so 50% − 50vw reaches both
          viewport edges; body's overflow-x: clip trims any scrollbar overlap). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 inset-x-[calc(50%-50vw)] -z-10 origin-bottom scale-y-0 bg-ink transition-transform duration-[650ms] ease-out-expo group-hover:scale-y-100"
      />

      <div className="grid grid-cols-12 gap-x-6 gap-y-2 py-6 md:items-baseline md:gap-y-1.5 md:py-8 lg:py-9">
        <p
          data-award-cell
          className={cn("col-span-12 font-mono text-xs tracking-[0.04em] text-muted md:col-span-2 lg:col-span-1", flip, "group-hover:text-paper-dim")}
        >
          {award.year}
        </p>

        <p
          data-award-cell
          className={cn("col-span-12 text-title font-medium text-ink md:col-span-6 lg:col-span-5", flip, "group-hover:text-paper")}
        >
          {/* RollText can't wrap, so it only takes over where the column is
              wide enough for any title; smaller screens get plain text. */}
          <span className="lg:hidden">{award.title}</span>
          <span className="hidden lg:inline">
            <RollText text={award.title} />
          </span>
        </p>

        <p
          data-award-cell
          className={cn(
            "col-span-12 text-[1.0625rem] leading-snug font-medium tracking-[-0.01em] md:col-span-4 lg:col-span-3",
            flip,
            win ? "text-accent group-hover:text-accent-soft" : "text-ink group-hover:text-paper",
          )}
        >
          {award.result}
        </p>

        <p
          data-award-cell
          className={cn(
            "col-span-12 text-sm leading-snug text-muted md:col-span-4 md:col-start-9 lg:col-span-3 lg:col-start-auto lg:text-right",
            flip,
            "group-hover:text-paper-dim",
          )}
        >
          {award.detail}
        </p>
      </div>
    </li>
  );
}
