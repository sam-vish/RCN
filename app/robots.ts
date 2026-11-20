import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // Vercel previews are never indexed.
  if (process.env.VERCEL_ENV === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/team", "/admin", "/api/", "/og"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
