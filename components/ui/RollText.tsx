import { cn } from "@/lib/cn";

type RollTextProps = {
  text: string;
  className?: string;
  /** Delay between characters, in ms. */
  step?: number;
};

/**
 * Hover "roll": each character slides up and a copy rolls in from below,
 * staggered. Pure CSS — put `group` on the interactive parent (link/button).
 * Screen readers get the plain text once.
 */
export default function RollText({ text, className, step = 14 }: RollTextProps) {
  const chars = Array.from(text);
  const charClass =
    "inline-block transition-transform duration-[650ms] ease-out-expo motion-reduce:transition-none";

  return (
    <span className={cn("relative inline-flex overflow-hidden align-top leading-[1.15]", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex whitespace-pre">
        {chars.map((c, i) => (
          <span
            key={i}
            className={cn(charClass, "group-hover:-translate-y-[115%] group-focus-visible:-translate-y-[115%]")}
            style={{ transitionDelay: `${i * step}ms` }}
          >
            {c}
          </span>
        ))}
      </span>
      <span aria-hidden className="absolute inset-0 flex whitespace-pre">
        {chars.map((c, i) => (
          <span
            key={i}
            className={cn(charClass, "translate-y-[115%] group-hover:translate-y-0 group-focus-visible:translate-y-0")}
            style={{ transitionDelay: `${i * step}ms` }}
          >
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}
