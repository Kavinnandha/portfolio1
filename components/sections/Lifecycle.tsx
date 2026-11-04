import { lifecycle, sections } from "@/lib/content";
import SectionHeader, { Emphasis } from "@/components/ui/SectionHeader";
import ScrollWords from "@/components/motion/ScrollWords";
import LifecycleTrace from "./lifecycle/LifecycleTrace";

/**
 * How I build (#approach) — the paper-2 band. One request is followed
 * through all eight layers (pinned on desktop, a flowing timeline elsewhere),
 * then the section closes on the four questions as a pull quote.
 */
export default function Lifecycle() {
  const { index, label, meta } = sections.approach;

  return (
    <section id="approach" className="relative bg-paper-2">
      <div className="container-site pt-section">
        <SectionHeader
          index={index}
          label={label}
          meta={meta}
          title={<Emphasis text={lifecycle.title} />}
          intro={lifecycle.intro}
        />
      </div>

      <LifecycleTrace />

      <figure className="container-site pt-[clamp(5rem,11vw,10rem)] pb-section">
        <div className="grid gap-y-4 lg:grid-cols-12 lg:gap-x-6">
          <span
            aria-hidden
            className="font-serif text-[clamp(4.5rem,9vw,9rem)] leading-[0.75] text-accent lg:col-span-1 lg:text-right"
          >
            “
          </span>
          <ScrollWords
            as="blockquote"
            text={lifecycle.quote}
            className="max-w-[24ch] font-serif text-[clamp(2.25rem,5.2vw,5.25rem)] leading-[1.02] tracking-[-0.02em] text-ink italic lg:col-span-10"
          />
        </div>
      </figure>
    </section>
  );
}
