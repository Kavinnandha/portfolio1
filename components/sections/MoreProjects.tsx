import { moreProjects, sections } from "@/lib/content";
import MoreHeader from "./more/MoreHeader";
import ProjectIndex from "./more/ProjectIndex";

/**
 * More projects (#projects) — the non-featured builds as an editorial index
 * of disclosures, directly after the featured gallery.
 */
export default function MoreProjects() {
  const first = moreProjects[0]?.index;
  const last = moreProjects[moreProjects.length - 1]?.index;
  const range = first && last ? (first === last ? first : `${first}—${last}`) : "";

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative pt-[clamp(4.5rem,9vw,9rem)] pb-section">
      {/* Without JavaScript the disclosures can't toggle, so show every panel open. */}
      <noscript>
        <style>{`#projects [data-more-panel]{height:auto!important;visibility:visible!important}#projects [data-more-icon]{display:none!important}`}</style>
      </noscript>

      <div className="container-site">
        <MoreHeader id="projects-title" range={range} {...sections.more} />
        <ProjectIndex projects={moreProjects} />
      </div>
    </section>
  );
}
