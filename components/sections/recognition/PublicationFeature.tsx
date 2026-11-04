import { publication } from "@/lib/content";
import { PillLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import SubHeading from "./SubHeading";
import { subLabels, ui } from "./labels";

/**
 * The paper, as a featured block: venue in mono, the title large in the
 * serif italic, the citation line and one external link.
 */
export default function PublicationFeature({ number }: { number: string }) {
  return (
    <article
      data-pub
      aria-labelledby="recognition-publication"
      className="relative mt-24 grid grid-cols-12 gap-x-6 gap-y-8 pt-8 md:mt-32 md:pt-10 lg:mt-40"
    >
      <span aria-hidden data-pub-line className="absolute inset-x-0 top-0 h-px bg-line-strong" />

      <div className="col-span-12 lg:col-span-3">
        <SubHeading id="recognition-publication" number={number} label={subLabels.publication} />
      </div>

      <div className="col-span-12 lg:col-span-9">
        <p data-pub-fade className="max-w-[60ch] font-mono text-[0.8125rem] leading-relaxed text-muted">
          {publication.venue}
        </p>

        <h4
          data-pub-title
          className="mt-5 max-w-[22ch] font-serif text-[length:clamp(2.25rem,5.6vw,6rem)] leading-[0.98] font-normal tracking-[-0.025em] text-ink italic md:mt-7"
        >
          {publication.title}
        </h4>

        <div className="mt-10 flex flex-col items-start gap-6 md:mt-14 md:flex-row md:items-center md:justify-between">
          <p data-pub-foot className="font-mono text-[0.8125rem] leading-relaxed text-ink-2">
            {publication.detail}
          </p>
          <div data-pub-foot>
            <PillLink
              href={publication.href}
              label={ui.readPaper}
              variant="outline"
              external
              magnetic
              icon={<ArrowUpRight size={18} />}
              data-cursor="view"
              data-cursor-label={ui.readCursor}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
