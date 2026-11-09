import Reveal from "@/components/motion/Reveal";
import { PillLink } from "@/components/ui/Button";
import { Download } from "@/components/ui/Icons";
import { contact, profile, sections, socials } from "@/lib/content";
import Badge from "./contact/Badge";
import Channels, { type Channel } from "./contact/Channels";
import ContactFrame from "./contact/ContactFrame";
import ContactTitle from "./contact/ContactTitle";
import EmailCopy from "./contact/EmailCopy";

const PHONE_LABEL = contact.ui.phone;

/**
 * (07) Contact — the dark finale. The Footer follows directly underneath in
 * the same ink, so this section draws no bottom rule and keeps its colour to
 * the very edge.
 */
export default function Contact() {
  const { index, label, meta } = sections.contact;
  const emailLabel = socials.find((s) => s.href.startsWith("mailto:"))?.label ?? "Email";
  const channels: Channel[] = [
    ...socials
      .filter((s) => s.href.startsWith("http"))
      .map((s) => ({ label: s.label, value: s.handle, href: s.href, external: true })),
    { label: PHONE_LABEL, value: profile.phone, href: profile.phoneHref },
  ];
  const badgeText = `${[profile.role, profile.relocation].join(" · ")} · `;

  return (
    <ContactFrame>
      <div className="container-site pt-section pb-20 md:pb-28">
        <Reveal
          y={16}
          className="label flex items-center justify-between gap-6 border-b border-line-inverse pb-4 text-paper-dim"
        >
          <span className="flex items-center gap-3">
            <span className="text-paper">({index})</span>
            <span>{label}</span>
          </span>
          {meta ? <span className="hidden text-right sm:block">{meta}</span> : null}
        </Reveal>

        <div className="relative mt-10 md:mt-14">
          <ContactTitle lines={contact.titleLines} />
          <Badge
            text={badgeText}
            className="absolute top-0 right-0 hidden size-32 md:block lg:size-36 xl:size-44"
          />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-14 md:mt-24 lg:grid-cols-12 lg:gap-x-10">
          <Reveal stagger={0.1} className="lg:col-span-4">
            <p data-reveal className="max-w-[34ch] text-lede text-paper-dim">
              {contact.body}
            </p>
            <div data-reveal className="mt-8 md:mt-10">
              <PillLink
                href={profile.resume.href}
                label={profile.resume.label}
                variant="accent"
                download={profile.resume.fileName}
                icon={<Download size={18} />}
                magnetic
              />
            </div>
          </Reveal>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal y={32}>
              <EmailCopy email={profile.email} label={emailLabel} />
            </Reveal>
            <Channels items={channels} className="mt-12 md:mt-16" />
          </div>
        </div>
      </div>
    </ContactFrame>
  );
}
