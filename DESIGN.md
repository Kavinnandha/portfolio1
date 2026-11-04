# Design system & conventions

Single-page portfolio for Kavin Nandha M K (Software Engineer). Light, editorial,
Awwwards-grade motion. Next.js 16.4 (App Router, Turbopack, Cache Components),
React 19.3, TypeScript, Tailwind CSS v4, GSAP 3.15 (ScrollTrigger + SplitText),
Lenis 1.3.

> Next.js 16.4 differs from older versions. Read the relevant guide in
> `node_modules/next/dist/docs/` before using a Next API you haven't checked.

## Content

All copy lives in `lib/content.ts`. Sections import from it and never hard-code
copy. In strings, `*asterisks*` mark serif-italic emphasis; render them with
`<Emphasis text={...} />` (from `components/ui/SectionHeader`) or `ScrollWords`.

## Tokens (Tailwind utilities, defined in `app/globals.css` `@theme`)

| Kind | Utilities |
|---|---|
| Colour | `paper` `#f4f2ed` (page), `paper-2`, `paper-3` (darker paper), `ink` `#0f0f0e`, `ink-2`, `muted`, `line`, `line-strong`, `accent` `#2b44ff`, `accent-ink`, `accent-soft`; on dark: `paper-dim`, `line-inverse` |
| Type | `font-sans` (Geist), `font-mono` (Geist Mono), `font-serif` (Instrument Serif). Sizes: `text-display-xl`, `text-display`, `text-headline`, `text-title`, `text-lede`, `text-label` (fluid, include line-height + tracking) |
| Layout | `container-site` (max 1600px + side gutters), `px-gutter`, `py-section`, `max-w-site` |
| Misc | `label` (mono, uppercase, tracked), `hairline` (1px rule), `ease-out-expo`, `ease-out-quart`, `ease-in-out-quart` |

`<em>` inside `h1`/`h2`/`h3` (or any `.serif-em` element) renders in the serif italic automatically.

Section rhythm: everything is on `paper`, except the Lifecycle band (`paper-2`)
and the closing Contact + Footer (`ink`, with `data-theme="dark"`).

## Motion

- Import GSAP only from `@/lib/gsap` (`gsap`, `ScrollTrigger`, `SplitText`, `useGSAP`, `EASE`, `DUR`, `prefersReducedMotion`, `hasFinePointer`).
- Always animate inside `useGSAP(() => {...}, { scope })` so everything is reverted on unmount.
- `prefersReducedMotion()` → skip the timeline and leave content in its final state.
- Never hide content with CSS alone. Set initial states from GSAP (`gsap.from`, `gsap.set`) so content is visible with JavaScript off. Use `opacity`, not `autoAlpha`, for reveals so content stays focusable.
- Entrances: `expo.out`, ~0.9–1.3s, small staggers. Travel: `power4.inOut`.
- Lenis drives scrolling; ScrollTrigger is synced to it. `getLenis()` / `useLenis()` / `scrollToTarget()` live in `components/providers/SmoothScroll.tsx`. In-page `#anchor` links are smoothed automatically.

### Shared primitives

| Component | Use |
|---|---|
| `motion/Reveal` | Fade + lift on first view. `data-reveal` children stagger. Props: `as, y, delay, duration, stagger, start`. |
| `motion/SplitReveal` | Masked line/word/char rise for headings. Props: `as, type ("lines"\|"words"\|"chars"), delay, duration, stagger, start`. |
| `motion/ScrollWords` | Scroll-scrubbed word fill (dim → solid). Prop `text` supports `*em*`. |
| `motion/Magnetic` | Pulls a child toward the pointer (mouse only). |
| `motion/Parallax` | Scrubbed vertical drift of its child (auto-oversized). |
| `ui/Button` → `PillLink`, `TextLink` | All CTAs. `PillLink` variants: `solid`, `outline`, `accent`, `inverse`. |
| `ui/RollText` | Per-character hover roll; parent needs the `group` class. |
| `ui/SectionHeader` (+ `Emphasis`) | Standard section opener: `(index) label` row, hairline, masked headline, optional intro. Prop `inverse` for dark sections. |
| `ui/Icons` | `ArrowUpRight, ArrowRight, ArrowDown, ArrowUp, Download, Copy, Check, Mail, Phone, GitHub, LinkedIn`. |

### Contracts between components

- **Preloader** → calls `markPreloaderDone()` (`lib/preloader.ts`) the moment its curtain starts to lift. Above-the-fold entrances subscribe with `onPreloaderDone(cb)`; SmoothScroll unlocks scrolling then.
- **Cursor** → reads attributes on hovered elements: `data-cursor="hover"` (grow), `data-cursor="view"` + `data-cursor-label="Open"` (large accent disc with a label), `data-cursor="hide"`. Links and buttons get the hover state by default.
- **Dark sections** carry `data-theme="dark"`; the nav switches to light text over them.
- Overlay chrome carries `data-preloader`, `data-cursor-root`, `data-scroll-progress`, and is hidden when JavaScript is off.

## Cache Components rules

The page is prerendered. Never call `Date.now()`, `new Date()`, `Math.random()`
or `crypto.randomUUID()` while rendering — even in client components. Do it in
an effect, a `useGSAP` callback or an event handler.

## Accessibility & performance baseline

- Semantic landmarks, one `h1` (the hero name), headings in order.
- Everything works by keyboard; visible `:focus-visible`; Esc closes overlays.
- Touch devices: no hover-only information; no custom cursor.
- Respect `prefers-reduced-motion` everywhere.
- Canvas/WebGL: cap DPR at 2, pause offscreen and in hidden tabs, fall back to CSS.
- No new runtime dependencies without a reason.
