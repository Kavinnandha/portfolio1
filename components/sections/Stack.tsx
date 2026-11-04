import SectionHeader, { Emphasis } from "@/components/ui/SectionHeader";
import { marqueeRows, sections, skillGroups } from "@/lib/content";
import Marquee from "./stack/Marquee";
import SkillGrid from "./stack/SkillGrid";

/**
 * (04) Stack — the tools, twice: first as a full-bleed scroll-reactive
 * ticker, then grouped by the job each one does, with a note on why.
 */
export default function Stack() {
  const { index, label, meta, title } = sections.stack;
  return (
    <section id="stack" className="relative py-section">
      <div className="container-site">
        <SectionHeader index={index} label={label} meta={meta} title={<Emphasis text={title} />} />
      </div>

      <Marquee rows={marqueeRows} />

      <div className="container-site mt-14 md:mt-20">
        <SkillGrid groups={skillGroups} />
      </div>
    </section>
  );
}
