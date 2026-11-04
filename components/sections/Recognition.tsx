"use client";

import { useRef } from "react";
import { awards, sections } from "@/lib/content";
import SectionHeader, { Emphasis } from "@/components/ui/SectionHeader";
import { prefersReducedMotion, useGSAP } from "@/lib/gsap";
import AwardRow from "./recognition/AwardRow";
import Certifications from "./recognition/Certifications";
import PublicationFeature from "./recognition/PublicationFeature";
import SubHeading from "./recognition/SubHeading";
import { pad2, subLabels } from "./recognition/labels";
import { animateRecognition } from "./recognition/motion";

/**
 * (05) Recognition — awards as an Awwwards-style list, the published paper
 * as a featured block, and certifications as a compact grid of cards.
 */
export default function Recognition() {
  const ref = useRef<HTMLElement>(null);
  const s = sections.recognition;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      animateRecognition(root);
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="recognition" className="relative bg-paper py-section">
      <div className="container-site">
        <SectionHeader index={s.index} label={s.label} meta={s.meta} title={<Emphasis text={s.title} />} />

        <div>
          <SubHeading
            id="recognition-awards"
            number={`${s.index}.1`}
            label={subLabels.awards}
            aside={pad2(awards.length)}
            className="pb-5"
          />
          {/* role="list": Safari drops list semantics once list-style is none. */}
          <ul role="list" aria-labelledby="recognition-awards">
            {awards.map((award) => (
              <AwardRow key={`${award.year}-${award.title}`} award={award} />
            ))}
          </ul>
          <span aria-hidden data-award-end className="block h-px bg-line-strong" />
        </div>

        <PublicationFeature number={`${s.index}.2`} />
        <Certifications number={`${s.index}.3`} />
      </div>
    </section>
  );
}
