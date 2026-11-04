import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";

type SectionHeaderProps = {
  /** Two-digit section number, e.g. "04". */
  index: string;
  label: string;
  title: ReactNode;
  /** Optional right-aligned mono note on the label row. */
  meta?: string;
  /** Paragraph under the title. */
  intro?: ReactNode;
  className?: string;
  /** For dark (ink) sections. */
  inverse?: boolean;
  titleClassName?: string;
};

/**
 * The shared section opener: a mono label row over a hairline, then a big
 * masked headline. Keeps every section's top edge consistent.
 */
export default function SectionHeader({
  index,
  label,
  title,
  meta,
  intro,
  className,
  inverse = false,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <header className={cn("mb-14 md:mb-20", className)}>
      <Reveal
        y={16}
        className={cn(
          "label flex items-center justify-between gap-6 border-b pb-4",
          inverse ? "border-line-inverse text-paper-dim" : "border-line text-muted",
        )}
      >
        <span className="flex items-center gap-3">
          <span className={inverse ? "text-paper" : "text-ink"}>({index})</span>
          <span>{label}</span>
        </span>
        {meta ? <span className="hidden text-right sm:block">{meta}</span> : null}
      </Reveal>
      <SplitReveal
        as="h2"
        className={cn(
          "mt-8 max-w-[18ch] text-headline font-medium md:mt-10",
          inverse ? "text-paper" : "text-ink",
          titleClassName,
        )}
      >
        {title}
      </SplitReveal>
      {intro ? (
        <Reveal
          delay={0.15}
          className={cn("mt-6 max-w-[58ch] text-lede md:mt-8", inverse ? "text-paper-dim" : "text-ink-2")}
        >
          {intro}
        </Reveal>
      ) : null}
    </header>
  );
}

/**
 * Renders a string where *asterisk-wrapped* phrases become <em> (serif
 * italic inside headings). Lets content.ts carry emphasis without JSX.
 */
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? <em key={i}>{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}
