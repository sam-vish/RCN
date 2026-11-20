import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import { formatEventDate, pastGatherings } from "@/content/events";
import { SITE_URL } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { LoopVideo } from "@/components/motion/LoopVideo";
import { PlayTrigger } from "@/components/motion/VideoModal";
import { JsonLd } from "@/components/layout/JsonLd";
import { EventRegistrationForm } from "@/components/forms/forms";
import { Icon, Pending, PlaceholderMedia, TextLink } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) return {};
  return pageMetadata({
    title: `${e.title} | ${formatEventDate(e)}`,
    description: e.summary,
    path: `/events/${e.slug}`,
    ogTitle: e.title,
    ogSub: formatEventDate(e),
    ogImage: "conference",
    noindex: e.sample,
  });
}

function icsHref(e: { title: string; startDate?: string; endDate?: string; venue?: string; slug: string }) {
  if (!e.startDate) return null;
  const d = (iso: string) => iso.replace(/-/g, "");
  const end = new Date(`${e.endDate ?? e.startDate}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RCN North America//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@rcnnorthamerica.com`,
    `DTSTART;VALUE=DATE:${d(e.startDate)}`,
    `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, "")}`,
    `SUMMARY:${e.title}`,
    e.venue ? `LOCATION:${e.venue.replace(/,/g, "\\,")}` : "",
    `URL:${SITE_URL}/events/${e.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics.join("\r\n"))}`;
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) notFound();
  const past = slug === "marching-orders" ? pastGatherings.filter((p) => /marching/i.test(p.title)) : [];
  const ics = icsHref(e);

  return (
    <>
      {!e.sample && e.startDate && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.title,
            startDate: e.startDate,
            ...(e.endDate ? { endDate: e.endDate } : {}),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: { "@type": "Place", name: e.venue ?? e.city ?? "TBA", address: e.address ?? e.city ?? "" },
            description: e.summary,
            organizer: { "@type": "Organization", name: "Remnant Christian Network North America", url: SITE_URL },
            url: `${SITE_URL}/events/${e.slug}`,
          }}
        />
      )}
      <section className="on-night relative flex min-h-[78svh] items-end overflow-hidden bg-night text-on-night">
        <LoopVideo name={e.video ?? "conference"} priority className="absolute inset-0" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/45 to-night/10" />
        <div className="wrap relative z-10 pb-14 pt-40 md:pb-20">
          {e.sample && (
            <p className="mb-5 inline-flex rounded-full border-2 border-dashed border-gold/70 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.16em] text-gold">
              Sample event page · not a real announcement yet
            </p>
          )}
          <p className="eyebrow mb-4">{e.scope === "network" ? "National conference" : e.scope === "itinerary" ? "Apostle's itinerary" : "Branch event"}</p>
          <h1 className="display max-w-5xl text-[clamp(44px,7.8vw,117px)] leading-[0.98]">{e.title}</h1>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-lg">
            <span className="flex items-center gap-2">
              <Icon name="calendar" className="h-5 w-5 text-gold" /> {formatEventDate(e)}
            </span>
            <span className="flex items-center gap-2">
              <Icon name="pin" className="h-5 w-5 text-gold" /> {e.venue ?? "Venue to be announced"}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {e.registration && (
              <a href="#register" className="btn-accent inline-flex min-h-12 items-center rounded-full px-6 text-[15px] font-semibold">
                Register
              </a>
            )}
            {ics ? (
              <a href={ics} download={`${e.slug}.ics`} className="inline-flex min-h-12 items-center rounded-full border border-on-night/35 px-6 text-[15px] font-semibold hover:bg-on-night/10">
                Add to calendar
              </a>
            ) : (
              <span className="inline-flex min-h-12 items-center rounded-full border border-dashed border-on-night/30 px-6 text-[14px] text-on-night/70">Add to calendar · once dates are set</span>
            )}
          </div>
          {e.confirm && <Pending tone="night" className="mt-6">{e.confirm}</Pending>}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="display text-[34px]">About</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink/85">{e.summary}</p>

            <h2 className="display mt-14 text-[28px]">Speakers</h2>
            <ul className="mt-5 flex flex-wrap gap-4">
              {(e.speakers ?? []).map((s) => (
                <li key={s} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 pr-5">
                  {s === "Apostle Arome Osayi" && (
                    <span className="relative h-14 w-14 overflow-hidden rounded-xl">
                      <Image src="/images/leaders/apostle-arome-osayi.jpg" alt="" fill sizes="56px" className="object-cover object-top" />
                    </span>
                  )}
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
              {e.sample && (
                <li>
                  <PlaceholderMedia label="More speakers TBA" className="h-20 min-w-[200px] !rounded-2xl !p-3" />
                </li>
              )}
            </ul>

            <h2 className="display mt-14 text-[28px]">Schedule</h2>
            {e.schedule?.length ? (
              <ol className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface">
                {e.schedule.map((x) => (
                  <li key={x.time + x.title} className="flex gap-6 p-4">
                    <span className="w-28 shrink-0 font-semibold">{x.time}</span>
                    {x.title}
                  </li>
                ))}
              </ol>
            ) : (
              <PlaceholderMedia label="Schedule to be announced" className="mt-5 min-h-[140px]" />
            )}

            <h2 className="display mt-14 text-[28px]">Venue</h2>
            {e.address ? (
              <p className="mt-4">{e.address}</p>
            ) : (
              <PlaceholderMedia label="Venue & map to be announced" className="mt-5 min-h-[200px]" />
            )}

            {past.length > 0 && (
              <>
                <h2 className="display mt-14 text-[28px]">Past sessions</h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                  {past.flatMap((p) =>
                    p.videos.map((v) => (
                      <li key={v.id}>
                        <PlayTrigger id={v.id} title={`${p.title}: ${v.label}`} className="group block">
                          <span className="relative block aspect-video overflow-hidden rounded-2xl">
                            <Image src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 640px) 30vw, 92vw" className="object-cover transition-transform group-hover:scale-105" />
                          </span>
                          <span className="mt-2 block font-semibold group-hover:text-accent-ink">{v.label}</span>
                          <span className="block text-[13px] text-muted">
                            {p.title} · {formatEventDate(p)}
                          </span>
                        </PlayTrigger>
                      </li>
                    )),
                  )}
                </ul>
                {e.playlistId && (
                  <TextLink href={`https://www.youtube.com/playlist?list=${e.playlistId}`} className="mt-6">
                    Full Marching Orders playlist on YouTube
                  </TextLink>
                )}
              </>
            )}
          </div>

          {e.registration && (
            <aside id="register" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-line bg-surface p-6 md:p-8">
                <p className="eyebrow mb-2">Registration</p>
                <h2 className="display text-[31px]">Save your seat</h2>
                <p className="mb-6 mt-2 text-[15px] text-muted">We&apos;ll email a confirmation and send updates as the conference gets closer.</p>
                {e.sample && <Pending className="mb-5">Sample form: submissions are saved to the preview database so the team can test the flow.</Pending>}
                <EventRegistrationForm event={e.slug} />
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
