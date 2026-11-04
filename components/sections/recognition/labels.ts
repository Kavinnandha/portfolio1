import { recognitionUi, sections } from "@/lib/content";

/**
 * Sub-section names, read from the section meta
 * ("Awards · publication · certifications") so the copy lives in one place.
 */
const parts = sections.recognition.meta
  .split("·")
  .map((part) => part.trim())
  .filter(Boolean);

export const subLabels = {
  awards: parts[0] ?? "",
  publication: parts[1] ?? "",
  certifications: parts[2] ?? "",
} as const;

/** Interface strings — copy lives in lib/content.ts. */
export const ui = recognitionUi;

/** "4" → "04", matching the two-digit indices used across the site. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
