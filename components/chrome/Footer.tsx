import { footer, navLinks, profile, socials } from "@/lib/content";
import RollText from "@/components/ui/RollText";
import { ArrowUpRight, Download } from "@/components/ui/Icons";
import FooterMotion from "./FooterMotion";
import BackToTop from "./BackToTop";
import { FooterClock } from "./LocalTime";
import { chromeCopy } from "./copy";

const link =
  "group inline-flex items-center gap-2 py-1 text-[1.0625rem] tracking-[-0.015em] text-paper focus-visible:outline-paper";
const icon =
  "opacity-50 transition-[translate,opacity] duration-500 ease-out-expo group-hover:opacity-100 group-focus-visible:opacity-100";

/**
 * Closing band under Contact (both ink, joined by a hairline): link columns,
 * live local time, back-to-top, and a full-bleed wordmark.
 */
export default function Footer() {
  return (
    <FooterMotion className="relative overflow-hidden bg-ink text-paper">
      <div className="container-site">
        <div className="h-px bg-line-inverse" />
      </div>

      {/* Clip so the parallax content emerges from beneath the hairline. */}
      <div className="overflow-hidden">
        <div
          data-footer-rise
          className="container-site grid grid-cols-2 gap-x-6 gap-y-14 pt-16 pb-16 will-change-transform md:grid-cols-12 md:pt-24 md:pb-24"
        >
          <nav aria-labelledby="footer-nav-label" className="md:col-span-3">
            <p id="footer-nav-label" className="label mb-5 text-paper-dim">
              {chromeCopy.navigation}
            </p>
            <ul className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={link}>
                    <RollText text={item.label} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="label mb-5 text-paper-dim">{chromeCopy.elsewhere}</p>
            <ul className="flex flex-col gap-1">
              {socials.map((s) => {
                const external = s.href.startsWith("http");
                return (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={link}
                    >
                      <RollText text={s.label} />
                      <ArrowUpRight
                        size={14}
                        className={`${icon} group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}
                      />
                    </a>
                  </li>
                );
              })}
              <li>
                <a href={profile.resume.href} download={profile.resume.fileName} className={link}>
                  <RollText text={profile.resume.label} />
                  <Download size={14} className={`${icon} group-hover:translate-y-0.5`} />
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="label mb-5 text-paper-dim">{chromeCopy.localTime}</p>
            <FooterClock />
            <p className="mt-3 text-[0.95rem] leading-relaxed text-paper-dim">
              {profile.location}
              <br />
              {profile.relocation}
            </p>
          </div>

          <div className="flex items-start justify-end md:col-span-3">
            <BackToTop />
          </div>
        </div>
      </div>

      {/* Full-bleed wordmark; FooterMotion fits its size to the width. */}
      <div className="px-[clamp(0.75rem,1.6vw,2rem)]">
        <div data-footer-mark-box>
          <p
            data-footer-mark
            aria-hidden
            className="w-max overflow-hidden pt-[0.1em] pb-[0.02em] text-[16.5vw] leading-[0.8] font-medium tracking-[-0.06em] whitespace-nowrap text-paper select-none"
          >
            {`${profile.firstName} ${profile.lastName}`}
          </p>
        </div>
      </div>

      <div className="container-site">
        <div className="label flex flex-col gap-2 border-t border-line-inverse py-6 text-paper-dim sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyright}</p>
          <p>{footer.builtWith}</p>
        </div>
      </div>
    </FooterMotion>
  );
}
