import { cn } from "@/lib/cn";

type SubHeadingProps = {
  id?: string;
  /** Spec-style number, e.g. "05.1". */
  number: string;
  label: string;
  /** Right-aligned mono note, e.g. a count. */
  aside?: string;
  className?: string;
};

/** Small mono opener for a block inside the Recognition section. */
export default function SubHeading({ id, number, label, aside, className }: SubHeadingProps) {
  return (
    <div data-rec-fade className={cn("label flex items-center justify-between gap-6 text-muted", className)}>
      <h3 id={id} className="flex items-center gap-3">
        <span className="text-ink">{number}</span>
        {label ? <span>{label}</span> : null}
      </h3>
      {aside ? <span aria-hidden>{aside}</span> : null}
    </div>
  );
}
