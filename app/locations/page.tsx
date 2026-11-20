import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { Locator } from "@/components/map/Locator";
import { JsonLd } from "@/components/layout/JsonLd";
import { branches } from "@/content/branches";
import { SITE_URL } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Find a Branch Near You | Apostolic Churches in the US & Canada",
  description:
    "Find a Remnant Christian Network branch near you: 13 apostolic churches across the United States and Canada, with service times, addresses and directions.",
  path: "/locations",
  ogTitle: "Find a branch near you",
});

export default function LocationsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "RCN North America branches",
          itemListElement: branches.map((b, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/branches/${b.slug}`, name: b.shortName })),
        }}
      />
      <PageHeader
        kicker="Our locations"
        title="Find a branch near you"
        intro="Remnant Christian Network gathers in cities across North America. Use the map or list to locate a congregation, see service times, and plan your visit."
      />
      <section className="py-12 md:py-16">
        <div className="wrap">
          <Locator />
        </div>
      </section>
      <section aria-labelledby="all-h" className="border-t border-line py-16">
        <div className="wrap">
          <h2 id="all-h" className="display mb-8 text-[31px]">
            All branches
          </h2>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...branches]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((b) => (
                <li key={b.slug}>
                  <Link href={`/branches/${b.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-line py-3">
                    <span className="font-semibold group-hover:text-accent-ink">{b.shortName}</span>
                    <span className="text-[14px] text-muted">
                      {b.city}, {b.region}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </>
  );
}
