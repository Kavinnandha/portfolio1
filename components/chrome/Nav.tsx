"use client";

import { useCallback, useRef, useState } from "react";
import { navLinks, profile } from "@/lib/content";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { isPreloaderDone, onPreloaderDone } from "@/lib/preloader";
import { cn } from "@/lib/cn";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { PillLink } from "@/components/ui/Button";
import RollText from "@/components/ui/RollText";
import { Download } from "@/components/ui/Icons";
import MobileMenu, { unlockScroll } from "./MobileMenu";
import { NavClock } from "./LocalTime";
import { chromeCopy } from "./copy";

const MENU_ID = "site-menu";
/** Always shown within this distance of the top. */
const REVEAL_ZONE = 200;
/** Frosted background from here down. */
const FROST_AT = 24;
/** Ignore direction changes smaller than this (trackpad jitter). */
const DIRECTION_SLOP = 8;

const wordmark = `${profile.firstName} ${profile.lastName}`;

/**
 * Fixed top bar. Hides on the way down, returns on the way up, frosts once
 * off the top, flips to light-on-dark over any [data-theme="dark"] band, and
 * marks the section in view. Below 768px the links move into MobileMenu.
 */
export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(-1);
  const [dark, setDark] = useState(false);
  const [frosted, setFrosted] = useState(false);
  const [tucked, setTucked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    (_context, contextSafe) => {
      const header = headerRef.current;
      if (!header || !contextSafe) return;

      // Direction-aware hide/show + frosted background.
      let anchorY = window.scrollY;
      const onScroll = (y: number) => {
        setFrosted(y > FROST_AT);
        if (y < REVEAL_ZONE) {
          setTucked(false);
          anchorY = y;
        } else if (Math.abs(y - anchorY) > DIRECTION_SLOP) {
          setTucked(y > anchorY);
          anchorY = y;
        }
      };
      onScroll(window.scrollY);
      // refreshPriority -1 on every trigger here: measure after section pins exist.
      ScrollTrigger.create({ start: 0, end: "max", refreshPriority: -1, onUpdate: (self) => onScroll(self.scroll()) });

      // Light-on-dark while a dark band sits under the bar's centre line.
      const centreLine = (edge: "top" | "bottom") => () => `${edge} ${Math.round(header.offsetHeight / 2)}px`;
      const darkActive = new Set<ScrollTrigger>();
      // Query the document directly: selector strings inside this scoped
      // context would otherwise only search the header.
      Array.from(document.querySelectorAll<HTMLElement>('[data-theme="dark"]'))
        .filter((el) => !header.contains(el) && !el.parentElement?.closest('[data-theme="dark"]'))
        .forEach((el) =>
          ScrollTrigger.create({
            trigger: el,
            start: centreLine("top"),
            end: centreLine("bottom"),
            refreshPriority: -1,
            onToggle: (self) => {
              if (self.isActive) darkActive.add(self);
              else darkActive.delete(self);
              setDark(darkActive.size > 0);
            },
          }),
        );

      // Scroll-spy: a link stays active from its section until the next linked one.
      const targets = navLinks
        .map((link, index) => ({ index, el: document.getElementById(link.href.slice(1)) }))
        .filter((t): t is { index: number; el: HTMLElement } => t.el !== null);
      const spyActive = new Set<number>();
      targets.forEach(({ index, el }, i) => {
        const next = targets[i + 1]?.el;
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          ...(next ? { endTrigger: next, end: "top 45%" } : { end: "max" }),
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) spyActive.add(index);
            else spyActive.delete(index);
            setActive(spyActive.size ? Math.max(...spyActive) : -1);
          },
        });
      });

      // Entrance: drop in as the preloader curtain clears the top edge.
      if (isPreloaderDone() || prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-nav-item]", header);
      gsap.set(items, { y: -32, opacity: 0 });
      return onPreloaderDone(
        contextSafe(() => {
          gsap.to(items, {
            y: 0,
            opacity: 1,
            duration: 1.1,
            delay: 0.75,
            ease: EASE.out,
            stagger: 0.06,
            clearProps: "transform,opacity",
          });
        }),
      );
    },
    { scope: headerRef },
  );

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const navigate = useCallback((href: string) => {
    // Release the scroll lock first: Lenis ignores scrollTo() while stopped.
    unlockScroll();
    setMenuOpen(false);
    const target = href === "#top" ? 0 : document.getElementById(href.slice(1));
    if (target !== null) {
      scrollToTarget(target);
      history.replaceState(null, "", href === "#top" ? window.location.pathname : href);
    }
    menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        onFocusCapture={() => setTucked(false)}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[translate,color] duration-700 ease-out-expo",
          tucked && !menuOpen ? "-translate-y-full" : "translate-y-0",
          dark ? "text-paper" : "text-ink",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 border-b transition-[opacity,background-color,border-color] duration-500",
            frosted ? "opacity-100 backdrop-blur-md" : "opacity-0",
            dark ? "border-line-inverse bg-ink/75" : "border-line bg-paper/80",
          )}
        />

        <nav
          aria-label={chromeCopy.primaryNav}
          className="relative container-site grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:h-[72px] md:grid-cols-[1fr_auto_1fr]"
        >
          <div data-nav-item className="justify-self-start">
            <a
              href="#top"
              data-nav-home
              className={cn(
                "group flex items-start gap-1 text-[1.0625rem] font-semibold tracking-[-0.035em]",
                dark && "focus-visible:outline-paper",
              )}
            >
              <RollText text={wordmark} />
              <span aria-hidden className="mt-[0.2em] size-[0.32em] rounded-full bg-accent" />
            </a>
          </div>

          <ul className="hidden items-center md:flex">
            {navLinks.map((link, i) => (
              <li key={link.href} data-nav-item>
                <a
                  href={link.href}
                  aria-current={active === i ? "true" : undefined}
                  className={cn(
                    "group relative flex items-center py-2 pr-2.5 pl-4 text-[0.9375rem] font-medium tracking-[-0.01em] lg:pl-5",
                    dark && "focus-visible:outline-paper",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1/2 left-1.5 size-[5px] -translate-y-1/2 rounded-full bg-accent transition-[scale,opacity] duration-500 ease-out-expo lg:left-2",
                      active === i ? "scale-100 opacity-100" : "scale-0 opacity-0",
                    )}
                  />
                  <RollText text={link.label} />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-end gap-5 lg:gap-7">
            <div data-nav-item className="hidden lg:block">
              <NavClock />
            </div>
            <div data-nav-item className="hidden md:block">
              <PillLink
                href={profile.resume.href}
                download={profile.resume.fileName}
                label={profile.resume.label}
                variant={dark ? "inverse" : "solid"}
                icon={<Download size={15} />}
                magnetic
                className={cn("h-10! gap-2.5! px-5! text-sm!", dark && "focus-visible:outline-paper")}
              />
            </div>
            <button
              ref={menuButtonRef}
              data-nav-item
              type="button"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={() => setMenuOpen(true)}
              className={cn(
                "label flex h-10 items-center gap-3 rounded-full border px-4 transition-colors duration-500 md:hidden",
                dark ? "border-line-inverse focus-visible:outline-paper" : "border-line-strong",
              )}
            >
              <span>{chromeCopy.menu}</span>
              <span aria-hidden className="flex w-4 flex-col gap-[5px]">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu id={MENU_ID} open={menuOpen} active={active} onClose={closeMenu} onNavigate={navigate} />
    </>
  );
}
