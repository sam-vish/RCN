import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, EmptyState } from "@/components/ui";
import { SermonCard } from "@/components/sermons/SermonCard";
import { SermonFilters } from "@/components/sermons/SermonFilters";
import { JsonLd } from "@/components/layout/JsonLd";
import { branches } from "@/content/branches";
import { SITE_URL } from "@/content/site";
import { facets, filterSermons, formatDate, formatDuration, getLibrary, type SermonFilters as F } from "@/lib/sermons";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sermon Library | Messages from Apostle Arome Osayi & RCN",
  description:
    "Browse over 1,000 teachings from Apostle Arome Osayi and leaders across the network. Filter by speaker, series, branch and year. Free to watch.",
  path: "/sermons",
  ogTitle: "Sermon library",
});

const PER_PAGE = 24;
const FEATURED_SERIES = [
  "Marching Orders",
  "International Eagles Conference",
  "Behold the Man",
  "Gifts of Prophecy",
  "The Science of Altars",
  "The Chadash Experience",
  "Sounds of Ascent",
  "40 Days Fasting & Prayer",
];

export default async function SermonsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const f: F = { q: sp.q, speaker: sp.speaker, series: sp.series, branch: sp.branch, year: sp.year };
  const all = await getLibrary();
  const results = filterSermons(all, f);
  const fc = facets(all);
  const page = Math.max(1, Number(sp.page) || 1);
  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const slice = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const filtered = Object.values(f).some(Boolean);
  const series = FEATURED_SERIES.map((name) => ({ name, first: all.find((s) => s.series === name), count: all.filter((s) => s.series === name).length })).filter((x) => x.first);
  const branchName = (slug: string) => branches.find((b) => b.slug === slug)?.shortName ?? slug;
  const pageHref = (p: number) => {
    const u = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    if (p > 1) u.set("page", String(p));
    else u.delete("page");
    return `/sermons${u.toString() ? `?${u}` : ""}`;
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: slice.slice(0, 12).map((s, i) => ({
            "@type": "VideoObject",
            position: i + 1,
            name: s.title,
            uploadDate: s.date,
            thumbnailUrl: `https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${s.id}`,
            ...(s.duration ? { duration: `PT${Math.floor(s.duration / 60)}M${s.duration % 60}S` } : {}),
            url: `${SITE_URL}/sermons`,
          })),
        }}
      />
      <PageHeader
        kicker="Teaching archive"
        title="Sermon library"
        intro="Browse over 1,000 teachings from Apostle Arome Osayi and leaders across the network—free to watch, easy to search, and here whenever you want to study or revisit a message."
      />

      {!filtered && page === 1 && (
        <section aria-labelledby="series-h" className="pt-14">
          <div className="wrap">
            <h2 id="series-h" className="display mb-6 text-[28px]">
              Featured series
            </h2>
            <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-4 overflow-x-auto px-[var(--gutter)] pb-2">
              {series.map((x) => (
                <li key={x.name} className="w-[260px] shrink-0 snap-start">
                  <Link href={`/sermons?series=${encodeURIComponent(x.name)}`} className="group block">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-night">
                      <Image src={`https://i.ytimg.com/vi/${x.first!.id}/mqdefault.jpg`} alt="" fill sizes="260px" className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-night/90 to-transparent" />
                      <span className="absolute bottom-3 left-4 right-4 font-display text-[19px] font-semibold leading-tight text-on-night">{x.name}</span>
                    </div>
                    <p className="mt-2 text-[13px] text-muted">{x.count} messages</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="py-14">
        <div className="wrap">
          <Suspense>
            <SermonFilters
              total={results.length}
              speakers={fc.speakers.map(([v, c]) => ({ value: v, label: v, count: c }))}
              series={fc.series.map(([v, c]) => ({ value: v, label: v, count: c }))}
              branches={fc.branches.map(([v, c]) => ({ value: v, label: branchName(v), count: c }))}
              years={fc.years.map(([v, c]) => ({ value: v, label: v, count: c }))}
            />
          </Suspense>

          {slice.length ? (
            <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {slice.map((s, i) => (
                <li key={s.id}>
                  <SermonCard
                    priority={i < 4}
                    s={{ id: s.id, title: s.title, speaker: s.speaker, date: formatDate(s.date), duration: formatDuration(s.duration), tag: s.branch ? branchName(s.branch) : undefined }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10">
              <EmptyState icon="story" title="No messages match." body="Try fewer words, or clear a filter. Titles on YouTube often use the conference name, e.g. “IEC” or “40 Days”.">
                <Link href="/sermons" className="font-semibold text-accent-ink underline">
                  Clear all filters
                </Link>
              </EmptyState>
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
              {page > 1 && (
                <Link href={pageHref(page - 1)} className="h-11 rounded-full border border-line-strong px-5 py-2.5 text-[14px] font-semibold hover:border-ink">
                  ← Newer
                </Link>
              )}
              <span className="px-4 text-[14px] text-muted">
                Page {page} of {pages}
              </span>
              {page < pages && (
                <Link href={pageHref(page + 1)} className="h-11 rounded-full border border-line-strong px-5 py-2.5 text-[14px] font-semibold hover:border-ink">
                  Older →
                </Link>
              )}
            </nav>
          )}
          <p className="mt-12 text-center text-[13px] text-muted">
            Videos play from YouTube (privacy-enhanced mode). New uploads appear here within 30 minutes.
          </p>
        </div>
      </section>
    </>
  );
}
