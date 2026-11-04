import Reveal from "@/components/motion/Reveal";
import ScrollWords from "@/components/motion/ScrollWords";
import { intro, profile } from "@/lib/content";

/**
 * Unnumbered manifesto: a mono label (sticky beside the text on lg+) and the
 * statement as a scroll-scrubbed word fill.
 */
export default function Intro() {
  return (
    <section id="intro" aria-labelledby="intro-title" className="container-site py-section">
      <div className="grid grid-cols-12 gap-x-6 gap-y-8 md:gap-y-12">
        <div className="col-span-12 lg:col-span-3">
          <Reveal y={16} className="lg:sticky lg:top-28">
            <h2 id="intro-title" className="label flex items-center gap-2.5 text-ink">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
              {intro.label}
            </h2>
            <p className="mt-3 text-[0.8125rem] leading-snug text-muted">
              {profile.location} · {profile.relocation}
            </p>
          </Reveal>
        </div>
        <ScrollWords
          text={intro.statement}
          className="col-span-12 text-[length:clamp(2rem,4.4vw,4.4rem)] leading-[1.06] font-medium tracking-[-0.04em] text-ink lg:col-span-9"
        />
      </div>
    </section>
  );
}
