import { certificatesFolder, certifications } from "@/lib/content";
import { TextLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import CertificationCard from "./CertificationCard";
import SubHeading from "./SubHeading";
import { pad2, subLabels, ui } from "./labels";

/**
 * Certifications: label + "view all" in a narrow left column (desktop),
 * cards in a 2-up grid on the right. On small screens the link follows the
 * cards, which is also its place in the tab order.
 */
export default function Certifications({ number }: { number: string }) {
  return (
    <div data-certs className="relative mt-24 grid grid-cols-12 gap-x-6 gap-y-8 pt-8 md:mt-32 md:pt-10 lg:mt-40">
      <span aria-hidden data-cert-line className="absolute inset-x-0 top-0 h-px bg-line-strong" />

      <div className="col-span-12 lg:col-span-3">
        <SubHeading
          id="recognition-certifications"
          number={number}
          label={subLabels.certifications}
          aside={pad2(certifications.length)}
        />
      </div>

      <ul
        role="list"
        aria-labelledby="recognition-certifications"
        className="col-span-12 grid gap-3 sm:grid-cols-2 md:gap-4 lg:col-span-9 lg:row-span-2"
      >
        {certifications.map((cert) => (
          <CertificationCard key={`${cert.issuer}-${cert.title}`} cert={cert} />
        ))}
      </ul>

      <div data-rec-fade className="col-span-12 lg:col-span-3 lg:row-start-2 lg:self-end">
        <TextLink href={certificatesFolder} external className="label text-ink">
          {ui.viewAll}
          <ArrowUpRight size={13} />
        </TextLink>
      </div>
    </div>
  );
}
