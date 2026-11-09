"use client";

import { useSyncExternalStore } from "react";
import { profile } from "@/lib/content";
import { cn } from "@/lib/cn";
import {
  clockMinutes,
  clockSeconds,
  isPlaceholder,
  serverMinutes,
  serverSeconds,
  subscribeClock,
} from "./clock";

/** Live local time: "14:32" or, with seconds, "14:32:05". A stable placeholder on the server. */
export function useLocalTime(withSeconds = false): string {
  return useSyncExternalStore(
    subscribeClock,
    withSeconds ? clockSeconds : clockMinutes,
    withSeconds ? serverSeconds : serverMinutes,
  );
}

function LiveDot() {
  return (
    <span aria-hidden className="relative flex size-1.5 shrink-0">
      <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
      <span className="relative size-1.5 rounded-full bg-accent" />
    </span>
  );
}

/** "● 14:32 IST" — used in the nav and the mobile menu. */
export function NavClock({ className }: { className?: string }) {
  const time = useLocalTime(false);
  return (
    <p className={cn("label flex items-center gap-2 whitespace-nowrap", className)}>
      <LiveDot />
      <time className="tabular-nums" dateTime={isPlaceholder(time) ? undefined : time}>
        {time}
      </time>
      <span className="opacity-60">{profile.timezoneLabel}</span>
    </p>
  );
}

/** Large ticking clock with seconds, for the footer. */
export function FooterClock({ className }: { className?: string }) {
  const time = useLocalTime(true);
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      <time
        className="font-mono text-title tabular-nums tracking-[-0.04em]"
        dateTime={isPlaceholder(time) ? undefined : time}
      >
        {time}
      </time>
      <span className="label text-paper-dim">{profile.timezoneLabel}</span>
    </p>
  );
}
