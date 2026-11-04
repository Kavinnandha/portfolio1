import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import { Emphasis } from "@/components/ui/SectionHeader";

type MoreHeaderProps = {
  /** id for the headline, so the section can be labelled by it. */
  id: string;
  label: string;
  meta: string;
  title: string;
  /** Project-number range shown where a section index would sit, e.g. "06—08". */
  range: string;
};

/**
 * Compact opener for a sub-section: the same mono label row + hairline +
 * masked headline as SectionHeader, but with the project range in place of a
 * section number and a smaller headline, since it continues "Selected work".
 */
export default function MoreHeader({ id, label, meta, title, range }: MoreHeaderProps) {
  return (
    <header className="mb-10 md:mb-14">
      <Reveal y={16} className="label flex items-center justify-between gap-6 border-b border-line pb-4 text-muted">
        <span className="flex items-center gap-3">
          {range ? (
            <span aria-hidden className="text-ink">
              ({range})
            </span>
          ) : null}
          <span>{label}</span>
        </span>
        <span className="hidden text-right sm:block">{meta}</span>
      </Reveal>
      <SplitReveal
        as="h2"
        id={id}
        className="mt-8 max-w-[20ch] text-[clamp(2.125rem,4.4vw,4.25rem)] leading-[0.98] font-medium tracking-[-0.04em] text-ink md:mt-10"
      >
        <Emphasis text={title} />
      </SplitReveal>
    </header>
  );
}
