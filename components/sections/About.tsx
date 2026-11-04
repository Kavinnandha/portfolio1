import SectionHeader, { Emphasis } from "@/components/ui/SectionHeader";
import { about, sections } from "@/lib/content";
import Portrait from "./about/Portrait";
import AboutText from "./about/AboutText";

/**
 * (06) About — portrait beside the story on desktop; on phones the portrait
 * comes first at a constrained width, then the text.
 */
export default function About() {
  const { index, label, meta } = sections.about;
  return (
    <section id="about" className="relative py-section">
      <div className="container-site">
        <SectionHeader index={index} label={label} meta={meta} title={<Emphasis text={about.title} />} />

        <div className="grid grid-cols-1 gap-14 md:gap-16 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
          <Portrait className="w-[78%] max-w-[22rem] sm:w-full sm:max-w-[24rem] lg:col-span-5 lg:max-w-none xl:col-span-4" />
          <AboutText className="lg:col-span-7 lg:col-start-6" />
        </div>
      </div>
    </section>
  );
}
