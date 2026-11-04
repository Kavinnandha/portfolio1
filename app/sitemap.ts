import type { MetadataRoute } from "next";
import { profile } from "@/lib/content";

// A fixed date: the page is static, and Cache Components forbids reading the
// clock while prerendering. Bump it when the content meaningfully changes.
const LAST_UPDATED = "2026-11-04";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: profile.site, lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 1 }];
}
