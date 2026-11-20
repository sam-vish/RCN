import type { MetadataRoute } from "next";
import { branches } from "@/content/branches";
import { SITE_URL } from "@/content/site";

// Public pages only: /team and /admin are private and never listed (PRD §6.12).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/about-us", "/locations", "/sermons", "/events", "/giving", "/prayer", "/testimonies", "/newsletters", "/gallery", "/serve"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: p === "/sermons" ? ("daily" as const) : ("weekly" as const), priority: p === "" ? 1 : 0.7 })),
    ...branches.flatMap((b) => [
      { url: `${SITE_URL}/branches/${b.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
      { url: `${SITE_URL}/branches/${b.slug}/visit`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    ]),
  ];
}
