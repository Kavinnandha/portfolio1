import type { SVGProps } from "react";

/**
 * Four-point sparkle: the ticker separator, and the centre of the Contact
 * badge. An SVG rather than the ✦ glyph so it renders identically on every
 * platform (the glyph falls back to whatever symbol font the OS has).
 */
export default function Sparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable={false} {...props}>
      <path d="M12 0c.7 6.3 5.7 11.3 12 12-6.3.7-11.3 5.7-12 12-.7-6.3-5.7-11.3-12-12C6.3 11.3 11.3 6.3 12 0Z" />
    </svg>
  );
}
