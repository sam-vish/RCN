import Image from "next/image";
import Link from "next/link";
import { ButtonLink, EmptyState, PageHeader, Pending } from "@/components/ui";
import { PlayTrigger } from "@/components/motion/VideoModal";
import { LoopVideo } from "@/components/motion/LoopVideo";
import { NewsletterForm } from "@/components/forms/forms";
import { branches } from "@/content/branches";
import { emptyStates } from "@/content/words";
import { formatEventDate, pastGatherings, type RcnEvent } from "@/content/events";
import { getEvents } from "@/lib/events";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Events | Conferences, Retreats & Where Apostle Arome Is Ministering",
  description:
    "Retreats, conferences and special meetings from RCN branches across North America, including the Marching Orders Conference, plus where Apostle Arome Osayi is ministering next.",
  path: "/events",
  ogTitle: "Join us at what's coming up",
  ogImage: "conference",
});

const FILTERS = [
  { key: "", label: "All" },
  { key: "network", label: "Network" },
  { key: "branch", label: "Branches" },
  { key: "itinerary", label: "Apostle's itinerary" },
];

function EventCard({ e }: { e: RcnEvent }) {
  const b = e.branch ? branches.find((x) => x.slug === e.branch) : null;
  if (e.sample) {
    return (
      <Link href={`/events/${e.slug}`} className="on-night group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-night p-8 text-on-night md:col-span-2">
        {e.video && <LoopVideo name={e.video} className="absolute inset-0 opacity-75 transition-opacity group-hover:opacity-95" />}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-transparent" />
        <div className="relative max-w-2xl">
          <span className="rounded-full border-2 border-dashed border-gold/70 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.16em] text-gold">Sample · {formatEventDate(e)}</span>
          <p className="display mt-5 text-[clamp(34px,4.7vw,62px)] leading-[1]">{e.title}</p>
          <p className="mt-3 text-on-night/85">{e.summary}</p>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-gold">See the event page →</span>
        </div>
      </Link>
    );
  }
  return (
    <Link href={`/events/${e.slug}`} className="group flex flex-col rounded-3xl border border-line bg-surface p-7 hover:border-line-strong">
      <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-accent-ink">{formatEventDate(e)}</p>
      <p className="display mt-3 text-[28px] leading-tight group-hover:text-accent-ink">{e.title}</p>
      <p className="mt-2 text-muted">{[e.venue, e.city, b?.shortName].filter(Boolean).join(" · ")}</p>
      {e.registration && <span className="mt-auto pt-6 text-[14px] font-semibold text-accent-ink">Register →</span>}
    </Link>
  );
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const { scope = "" } = await searchParams;
  const events = await getEvents();
  const show = (s: string) => !scope || scope === s;
  const fromBranches = events.filter((e) => (e.scope === "network" || e.scope === "branch") && show(e.scope));
  const itinerary = events.filter((e) => e.scope === "itinerary");
  const realCount = fromBranches.filter((e) => !e.sample).length;

  return (
    <>
      <PageHeader
        video="conference"
        kicker="Events"
        title="Join us at what's coming up"
        intro="Retreats, conferences, and special meetings from our branches—plus the stops where Apostle Arome Osayi is ministering across the continent."
      >
        <nav aria-label="Filter events" className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key ? `/events?scope=${f.key}` : "/events"}
              aria-current={scope === f.key ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-[14px] font-semibold ${scope === f.key ? "border-on-night bg-on-night text-night" : "border-on-night/30 text-on-night hover:border-on-night"}`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </PageHeader>

      {scope !== "itinerary" && (
        <section aria-labelledby="branches-h" className="py-16 md:py-24">
          <div className="wrap">
            <p className="eyebrow mb-3">From our branches</p>
            <h2 id="branches-h" className="display mb-3 text-[clamp(28px,3.6vw,47px)]">
              Retreats, conferences, and special meetings
            </h2>
            <p className="mb-10 text-muted">Hosted by RCN branches across North America. Select an event to register.</p>
            <div className="grid gap-5 md:grid-cols-2">
              {fromBranches.map((e) => (
                <EventCard key={e.slug} e={e} />
              ))}
            </div>
            {realCount === 0 && (
              <div className="mt-5">
                <EmptyState title="Nothing on the calendar just yet." body="Join the newsletter and we'll tell you first.">
                  <div className="max-w-xl">
                    <NewsletterForm source="events-empty" />
                  </div>
                </EmptyState>
              </div>
            )}
          </div>
        </section>
      )}

      {(scope === "" || scope === "itinerary") && (
        <section aria-labelledby="itin-h" className="bg-surface-alt py-16 md:py-24">
          <div className="wrap">
            <p className="eyebrow mb-3">On the mission field</p>
            <h2 id="itin-h" className="display mb-3 text-[clamp(28px,3.6vw,47px)]">
              Where Apostle Arome is ministering next
            </h2>
            <p className="mb-10 text-muted">Meetings hosted by churches and ministries around the continent. Reach out to the host to join them.</p>
            {itinerary.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {itinerary.map((e) => (
                  <EventCard key={e.slug} e={e} />
                ))}
              </div>
            ) : (
              <EmptyState title="New dates are on the way." body={<>{emptyStates.itinerary} The Apostle&apos;s full itinerary lives on aromeosayi.org.</>}>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="https://www.aromeosayi.org" variant="ghost">
                    aromeosayi.org ↗
                  </ButtonLink>
                </div>
                <Pending className="mt-4">Share one itinerary table with the AAO site so dates appear on both automatically.</Pending>
              </EmptyState>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="past-h" className="on-night bg-night py-16 text-on-night md:py-24">
        <div className="wrap">
          <p className="eyebrow mb-3">Watch again</p>
          <h2 id="past-h" className="display mb-10 text-[clamp(28px,3.6vw,47px)]">
            Past national gatherings
          </h2>
          <div className="grid gap-10 lg:grid-cols-3">
            {pastGatherings.map((p) => (
              <article key={p.slug}>
                <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-gold">{formatEventDate(p)}</p>
                <h3 className="display mt-2 text-[25px] leading-tight">{p.title}</h3>
                <p className="mt-1 text-[15px] text-on-night-muted">{p.summary}</p>
                <ul className="mt-5 space-y-3">
                  {p.videos.map((v) => (
                    <li key={v.id}>
                      <PlayTrigger id={v.id} title={`${p.title}: ${v.label}`} className="group flex items-center gap-3">
                        <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg">
                          <Image src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" fill sizes="112px" className="object-cover" />
                        </span>
                        <span className="font-semibold group-hover:text-gold">{v.label}</span>
                      </PlayTrigger>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
