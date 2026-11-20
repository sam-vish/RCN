import type { Metadata } from "next";
import { SITE_URL, site } from "@/content/site";
import type { Branch } from "@/content/types";
import { WEEKDAYS, isActive } from "./schedule";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** Text on the generated share image (defaults to the title). */
  ogTitle?: string;
  ogSub?: string;
  ogImage?: "hero" | "boston" | "orlando" | "conference";
  /** Use the title exactly as given (branch pages carry their own pattern). */
  absolute?: boolean;
  noindex?: boolean;
};

export function pageMetadata({ title, description, path, ogTitle, ogSub, ogImage, absolute, noindex }: PageMeta): Metadata {
  const og = `/og?title=${encodeURIComponent(ogTitle ?? title)}${ogSub ? `&sub=${encodeURIComponent(ogSub)}` : ""}${ogImage ? `&img=${ogImage}` : ""}`;
  const full = absolute ? title : `${title} | ${site.name}`;
  return {
    title: { absolute: full },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: site.name, title: full, description, images: [{ url: og, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: full, description, images: [og] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: site.legalName,
  alternateName: ["RCN North America", "RCN NA"],
  url: SITE_URL,
  logo: `${SITE_URL}/brand/icon.png`,
  slogan: site.tagline,
  parentOrganization: { "@type": "Organization", name: "Remnant Christian Network", url: site.links.rcnGlobal },
  founder: { "@type": "Person", name: "Arome Osayi", url: site.links.aao },
  sameAs: [site.links.instagram, site.links.facebook, site.links.youtube, site.links.telegram],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: site.name,
  publisher: { "@id": `${SITE_URL}/#org` },
};

const DOW: Record<string, string> = Object.fromEntries(WEEKDAYS.map((d) => [d, `https://schema.org/${d}`]));

/** JSON-LD Church per branch: address, geo, contact, weekly opening hours from meeting times. */
export function branchJsonLd(b: Branch) {
  const street = b.address.split(",")[0].trim();
  const postal = b.address.match(/\b(\d{5}|[A-Z]\d[A-Z] ?\d[A-Z]\d)\b/)?.[1];
  const hours = b.meetings
    .filter((m) => m.start && m.recurrence.kind === "weekly" && m.day !== "Daily" && isActive(m) && !m.online)
    .map((m) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DOW[m.day],
      opens: m.start,
      ...(m.end ? { closes: m.end } : {}),
      name: m.title,
    }));
  return {
    "@context": "https://schema.org",
    "@type": ["Church", "PlaceOfWorship"],
    "@id": `${SITE_URL}/branches/${b.slug}#church`,
    name: `${b.shortName} (Remnant Christian Network)`,
    description: b.description,
    url: `${SITE_URL}/branches/${b.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: b.city,
      addressRegion: b.region,
      ...(postal ? { postalCode: postal } : {}),
      addressCountry: b.country === "Canada" ? "CA" : "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng },
    ...(b.emails[0] ? { email: b.emails[0] } : {}),
    ...(b.phones[0] ? { telephone: b.phones[0] } : {}),
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
    parentOrganization: { "@id": `${SITE_URL}/#org` },
    sameAs: Object.values(b.socials).filter(Boolean),
  };
}
