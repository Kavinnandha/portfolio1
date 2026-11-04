import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import Magnetic from "@/components/motion/Magnetic";
import RollText from "./RollText";

type Variant = "solid" | "outline" | "accent" | "inverse";

type PillLinkProps = {
  href: string;
  label: string;
  variant?: Variant;
  icon?: ReactNode;
  /** Wrap in a magnetic field (mouse only). */
  magnetic?: boolean;
  /** Opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

const variants: Record<Variant, { base: string; fill: string; hoverText: string }> = {
  solid: { base: "bg-ink text-paper border-ink", fill: "bg-accent", hoverText: "group-hover:text-white" },
  outline: { base: "bg-transparent text-ink border-line-strong", fill: "bg-ink", hoverText: "group-hover:text-paper" },
  accent: { base: "bg-accent text-white border-accent", fill: "bg-ink", hoverText: "group-hover:text-paper" },
  inverse: { base: "bg-transparent text-paper border-line-inverse", fill: "bg-paper", hoverText: "group-hover:text-ink" },
};

/**
 * Pill-shaped link with a rising colour fill and rolling label on hover.
 * Use for every call to action so they all behave the same.
 */
export function PillLink({
  href,
  label,
  variant = "solid",
  icon,
  magnetic = false,
  external = false,
  className,
  ...rest
}: PillLinkProps) {
  const v = variants[variant];
  const link = (
    <a
      href={href}
      data-cursor="hover"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      className={cn(
        "group relative isolate inline-flex h-12 items-center gap-3 overflow-hidden rounded-full border px-6 text-[0.95rem] font-medium tracking-[-0.01em] transition-colors duration-500 md:h-14 md:px-7",
        v.base,
        v.hoverText,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 -z-10 h-full origin-bottom scale-y-0 rounded-[inherit] transition-transform duration-[650ms] ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none",
          v.fill,
        )}
      />
      <RollText text={label} />
      {icon ? <span className="relative inline-flex shrink-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">{icon}</span> : null}
    </a>
  );
  return magnetic ? <Magnetic strength={0.25}>{link}</Magnetic> : link;
}

type TextLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

/** Inline link with an underline that wipes out and back in on hover. */
export function TextLink({ href, children, external = false, className, ...rest }: TextLinkProps) {
  return (
    <a
      href={href}
      data-cursor="hover"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      className={cn(
        "relative inline-flex items-center gap-1.5 bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-[position:100%_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo hover:bg-[length:0%_1px] hover:bg-[position:0%_100%] focus-visible:bg-[length:0%_1px]",
        className,
      )}
    >
      {children}
    </a>
  );
}
