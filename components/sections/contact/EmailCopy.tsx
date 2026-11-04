"use client";

import { useEffect, useRef, useState } from "react";
import RollText from "@/components/ui/RollText";
import { Check, Copy } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { contact } from "@/lib/content";

const UI = contact.ui;

/** Clipboard API first; a hidden-textarea + execCommand fallback for insecure contexts and older browsers. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  // Keyboard users stay on the button they pressed.
  active?.focus({ preventScroll: true });
  return ok;
}

/**
 * The primary channel: the address as a big mailto link (rolling characters,
 * an underline that draws on hover/focus) plus a copy button whose result is
 * shown on the button and announced politely to screen readers.
 */
export default function EmailCopy({ email, label, className }: { email: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = async () => {
    const ok = await copyText(email);
    if (!ok) return;
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className={className}>
      <span className="label text-paper-dim">{label}</span>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-5">
        <a
          href={`mailto:${email}`}
          data-cursor="view"
          data-cursor-label={contact.ui.emailCursor}
          className="group relative inline-flex pb-2 text-[clamp(1.125rem,6.2vw,1.5rem)] leading-[1.1] font-medium tracking-[-0.03em] text-paper sm:text-title"
        >
          <RollText text={email} step={9} />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line-inverse" />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-paper transition-transform duration-700 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
          />
        </a>

        <button
          type="button"
          onClick={onCopy}
          aria-label={UI.copyLabel}
          data-cursor="hover"
          className="label inline-flex h-10 items-center gap-2.5 rounded-full border border-line-inverse px-4 text-paper transition-colors duration-500 ease-out-expo hover:border-paper hover:bg-paper hover:text-ink"
        >
          <span className="relative size-4 overflow-hidden">
            <Copy
              className={cn(
                "absolute inset-0 transition-transform duration-500 ease-out-expo",
                copied ? "-translate-y-full" : "translate-y-0",
              )}
            />
            <Check
              className={cn(
                "absolute inset-0 transition-transform duration-500 ease-out-expo",
                copied ? "translate-y-0" : "translate-y-full",
              )}
            />
          </span>
          <span aria-hidden>{copied ? UI.copied : UI.copy}</span>
        </button>

        <span role="status" aria-live="polite" className="sr-only">
          {copied ? UI.copied : ""}
        </span>
      </div>
    </div>
  );
}
