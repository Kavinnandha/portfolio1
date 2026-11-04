"use client";

import { Fragment, useRef, type ElementType } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type ScrollWordsProps = {
  as?: ElementType;
  /** Plain text; wrap words in *asterisks* for serif-italic emphasis. */
  text: string;
  className?: string;
  /** Classes for emphasised words (on top of the serif italic). */
  emClassName?: string;
  start?: string;
  end?: string;
  /** Opacity of words that have not been read yet. */
  dim?: number;
};

/**
 * Words fill in from dim to solid as the block scrolls through the
 * viewport — scrubbed, so reading pace follows scroll pace.
 */
export default function ScrollWords({
  as: Tag = "p",
  text,
  className,
  emClassName,
  start = "top 78%",
  end = "bottom 42%",
  dim = 0.14,
}: ScrollWordsProps) {
  const ref = useRef<HTMLElement>(null);
  const tokens = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const words = el.querySelectorAll<HTMLElement>("[data-word]");
      gsap.fromTo(
        words,
        { opacity: dim },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start, end, scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn("serif-em", className)}>
      {tokens.map((raw, i) => {
        const m = raw.match(/^\*(.+?)\*([.,;:!?—-]*)$/);
        const word = m ? m[1] : raw;
        const trail = m ? m[2] : "";
        return (
          <Fragment key={i}>
            <span data-word className="inline-block">
              {m ? <em className={emClassName}>{word}</em> : word}
              {trail}
            </span>
            {i < tokens.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
