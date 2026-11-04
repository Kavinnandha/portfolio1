import type { Certification } from "@/lib/content";
import { TextLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { ui } from "./labels";

/** Issuer and year on top, title at the foot, plus a Verify link when one exists. */
export default function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <li
      data-cert-card
      className="flex min-h-[10.5rem] flex-col justify-between gap-10 rounded-2xl border border-line p-5 md:min-h-[12.5rem] md:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="label text-muted">{cert.issuer}</p>
        <p className="font-mono text-xs leading-[1.25] text-muted">{cert.year}</p>
      </div>

      <div>
        <h4 className="max-w-[24ch] text-lg leading-[1.2] font-medium tracking-[-0.02em] text-ink md:text-xl">
          {cert.title}
        </h4>
        {cert.href ? (
          <TextLink
            href={cert.href}
            external
            aria-label={`${ui.verify}: ${cert.title}`}
            className="label mt-4 text-accent"
          >
            {ui.verify}
            <ArrowUpRight size={12} />
          </TextLink>
        ) : null}
      </div>
    </li>
  );
}
