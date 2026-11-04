"use client";

import { scrollToTarget } from "@/components/providers/SmoothScroll";
import Magnetic from "@/components/motion/Magnetic";
import { ArrowUp } from "@/components/ui/Icons";
import { chromeCopy } from "./copy";

const arrow = "transition-[translate] duration-500 ease-out-expo motion-reduce:transition-none";

/** Glides to the top and hands keyboard focus back to the start of the page. */
export default function BackToTop() {
  const onClick = () => {
    scrollToTarget(0);
    document.querySelector<HTMLElement>("[data-nav-home]")?.focus({ preventScroll: true });
  };

  return (
    <Magnetic strength={0.2}>
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-4 focus-visible:outline-paper"
      >
        <span className="label text-paper-dim transition-colors duration-500 group-hover:text-paper group-focus-visible:text-paper">
          {chromeCopy.backToTop}
        </span>
        <span
          aria-hidden
          className="relative flex size-14 items-center justify-center overflow-hidden rounded-full border border-line-inverse transition-colors duration-500 group-hover:border-paper group-hover:bg-paper group-hover:text-ink group-focus-visible:border-paper group-focus-visible:bg-paper group-focus-visible:text-ink md:size-16"
        >
          <ArrowUp size={18} className={`${arrow} group-hover:-translate-y-[180%] group-focus-visible:-translate-y-[180%]`} />
          <ArrowUp
            size={18}
            className={`${arrow} absolute translate-y-[180%] group-hover:translate-y-0 group-focus-visible:translate-y-0`}
          />
        </span>
      </button>
    </Magnetic>
  );
}
