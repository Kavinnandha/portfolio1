# Kavin Nandha M K — Software Engineer portfolio

Single-page portfolio focused on software engineering: backend systems, APIs,
full-stack products and the infrastructure they ship on. Light, editorial
design with smooth scrolling, masked text reveals, a WebGL hero, a pinned
horizontal project gallery with live architecture diagrams, and a scroll-driven
"follow one request" walkthrough.

**Stack:** Next.js 16 (App Router, Turbopack, Cache Components) · React 19 ·
TypeScript · Tailwind CSS v4 · GSAP (ScrollTrigger, SplitText) · Lenis

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (fully static)
pnpm start        # serve the production build
pnpm lint
```

## Edit the content

Every word on the site is in [`lib/content.ts`](lib/content.ts): profile,
projects (including the architecture diagrams, as nodes and edges), experience,
skills, awards and contact details. In strings, `*asterisks*` render as
serif-italic emphasis.

- Résumé download: replace `public/Kavin_Nandha_MK_Resume_SoftwareEngineer.pdf` (keep the name, or update `profile.resume` in `lib/content.ts`).
- Portrait: `public/portrait.webp`.
- Design tokens (colours, type scale, spacing): `app/globals.css` → `@theme`.

## Structure

```
app/                 layout (fonts, metadata, JSON-LD), page, OG image, robots, sitemap
lib/content.ts       all copy and data
lib/gsap.ts          GSAP + plugins, easings, reduced-motion helpers
lib/preloader.ts     preloader → hero/scroll hand-off
components/chrome/   preloader, cursor, nav, scroll progress, footer
components/sections/ one file per section (+ a folder for its helpers)
components/motion/   shared motion primitives (Reveal, SplitReveal, ScrollWords, Magnetic, Parallax)
components/ui/       buttons, icons, section header
```

See [`DESIGN.md`](DESIGN.md) for the design system, motion rules and component contracts.

## Accessibility & performance

Respects `prefers-reduced-motion` (no smooth scroll, no timelines), works with
JavaScript disabled (all content is server-rendered), keyboard navigable, and
the custom cursor only appears on mouse/trackpad devices.

## Deploy

Built for Vercel (`kavin.codegarage.dev`). The production build is fully
static, so any static host that runs `next build` works too.
