"use client";

import { useEffect, useRef } from "react";
import { navLinks, profile, socials } from "@/lib/content";
import { EASE, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { getLenis } from "@/components/providers/SmoothScroll";
import { PillLink } from "@/components/ui/Button";
import RollText from "@/components/ui/RollText";
import { ArrowUpRight, Download } from "@/components/ui/Icons";
import { NavClock } from "./LocalTime";
import { chromeCopy } from "./copy";

let scrollLocked = false;

/** Freeze the page behind an overlay: Lenis when it runs, native overflow otherwise. */
export function lockScroll() {
  if (scrollLocked) return;
  scrollLocked = true;
  const lenis = getLenis();
  if (lenis) lenis.stop();
  else document.documentElement.style.overflow = "hidden";
}

/** Undo lockScroll(). Call it before any programmatic scroll — Lenis ignores scrollTo while stopped. */
export function unlockScroll() {
  if (!scrollLocked) return;
  scrollLocked = false;
  getLenis()?.start();
  document.documentElement.style.removeProperty("overflow");
}

type MobileMenuProps = {
  id: string;
  open: boolean;
  /** Index into navLinks of the section in view, or -1. */
  active: number;
  onClose: (restoreFocus: boolean) => void;
  /** Close the menu and travel to an in-page anchor. */
  onNavigate: (href: string) => void;
};

const focusRing = "focus-visible:outline-paper";

/**
 * Full-screen ink menu for small screens: wipes down from the top, numbered
 * links rise out of their rows. Modal while open — focus is trapped, Esc
 * closes, the page behind is inert to scrolling.
 */
export default function MobileMenu({ id, open, active, onClose, onNavigate }: MobileMenuProps) {
  const root = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  // Build the open/close timeline once.
  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);
      timeline.current = gsap
        .timeline({
          paused: true,
          onReverseComplete: () => {
            el.style.visibility = "hidden";
          },
        })
        .fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: EASE.inOut },
        )
        .fromTo(q("[data-menu-rise]"), { yPercent: 105 }, { yPercent: 0, duration: 1, ease: EASE.out, stagger: 0.05 }, 0.3)
        .fromTo(
          q("[data-menu-fade]"),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8, ease: EASE.outSoft, stagger: 0.06 },
          0.42,
        );
      return () => {
        timeline.current = null;
      };
    },
    { scope: root },
  );

  // Play / reverse on state changes.
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const tl = timeline.current;
      if (open) {
        el.style.visibility = "visible";
        tl?.timeScale(1).play();
      } else if (tl && tl.progress() > 0) {
        tl.timeScale(1.6).reverse();
      } else {
        el.style.visibility = "hidden";
      }
    },
    { dependencies: [open], scope: root },
  );

  // Modal behaviour while open.
  useEffect(() => {
    const el = root.current;
    if (!open || !el) return;
    lockScroll();
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(true);
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || !el.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !el.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onBreakpoint = () => {
      if (desktop.matches) onClose(false);
    };

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onBreakpoint);
      unlockScroll();
    };
  }, [open, onClose]);

  return (
    <div
      ref={root}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={chromeCopy.menuDialog}
      inert={!open}
      data-lenis-prevent
      className="invisible fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-ink text-paper md:hidden"
    >
      <div className="container-site flex h-16 shrink-0 items-center justify-between">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("#top");
          }}
          className={cn("group flex items-start gap-1 text-[1.0625rem] font-semibold tracking-[-0.035em]", focusRing)}
        >
          <RollText text={`${profile.firstName} ${profile.lastName}`} />
          <span aria-hidden className="mt-[0.2em] size-[0.32em] rounded-full bg-accent" />
        </a>
        <button
          ref={closeRef}
          type="button"
          onClick={() => onClose(true)}
          className={cn("label flex h-10 items-center gap-3 rounded-full border border-line-inverse px-4", focusRing)}
        >
          <span>{chromeCopy.close}</span>
          <span aria-hidden className="relative block size-3">
            <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
            <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <nav aria-label={chromeCopy.menuNav} className="container-site mt-4 flex-1">
        <ol className="border-t border-line-inverse">
          {navLinks.map((link, i) => (
            <li key={link.href} className="overflow-hidden border-b border-line-inverse">
              <a
                data-menu-rise
                href={link.href}
                aria-current={active === i ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.href);
                }}
                className={cn("flex items-center gap-4 py-3 focus-visible:outline-offset-[-2px]", focusRing)}
              >
                <span className="label w-7 shrink-0 text-paper-dim">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[clamp(2.5rem,12vw,4.5rem)] leading-none font-medium tracking-[-0.045em]">
                  {link.label}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mr-1 ml-auto size-2 rounded-full bg-accent transition-[scale] duration-500 ease-out-expo",
                    active === i ? "scale-100" : "scale-0",
                  )}
                />
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="container-site grid gap-8 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div data-menu-fade>
          <p className="label mb-3 text-paper-dim">{chromeCopy.elsewhere}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => {
              const external = s.href.startsWith("http");
              return (
                <li key={s.href}>
                  <a
                    href={s.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={cn("group inline-flex items-center gap-1.5 py-1 text-[1.0625rem]", focusRing)}
                  >
                    <RollText text={s.label} />
                    <ArrowUpRight size={14} className="opacity-60" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div data-menu-fade className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <PillLink
            href={profile.resume.href}
            download={profile.resume.fileName}
            label={profile.resume.label}
            variant="inverse"
            icon={<Download size={16} />}
            className={focusRing}
          />
          <NavClock className="text-paper-dim" />
        </div>
      </div>
    </div>
  );
}
