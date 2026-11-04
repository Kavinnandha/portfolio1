"use client";

import { useRef } from "react";
import { experience, sections } from "@/lib/content";
import SectionHeader, { Emphasis } from "@/components/ui/SectionHeader";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import ExperienceRow from "./experience/ExperienceRow";
import { monthAxis } from "./experience/months";
import { animateExperienceRow } from "./experience/motion";

/** One month axis shared by every row, so overlapping roles line up. */
const axis = monthAxis(experience);

/**
 * (03) Experience — each role is a large editorial row. The internship
 * comes first and carries the most weight; the meta (and, on desktop, the
 * title) column sticks while the longer detail column scrolls by.
 */
export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  const s = sections.experience;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;

      root.querySelectorAll<HTMLElement>("[data-exp-row]").forEach(animateExperienceRow);

      const end = root.querySelector<HTMLElement>("[data-exp-end]");
      if (end) {
        gsap.from(end, {
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 1.4,
          ease: EASE.inOut,
          scrollTrigger: { trigger: end, start: "top 95%", once: true },
        });
      }
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="experience" className="relative bg-paper py-section">
      <div className="container-site">
        <SectionHeader index={s.index} label={s.label} meta={s.meta} title={<Emphasis text={s.title} />} />

        {/* role="list": Safari drops list semantics once list-style is none. */}
        <ol role="list">
          {experience.map((role, i) => (
            <ExperienceRow
              key={`${role.company}-${role.start}`}
              role={role}
              number={`${s.index}.${i + 1}`}
              axis={axis}
              featured={i === 0}
            />
          ))}
        </ol>
        <span aria-hidden data-exp-end className="block h-px bg-line-strong" />
      </div>
    </section>
  );
}
