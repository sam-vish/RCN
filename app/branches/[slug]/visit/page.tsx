import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBranch } from "@/content/branches";
import { defaultWhatToExpect } from "@/content/words";
import { formatInZone, isActive, isSchedulable, meetingTime, occurrences, tzAbbr } from "@/lib/schedule";
import { pageMetadata } from "@/lib/seo";
import { getBranchContent, withContent } from "@/lib/branch-content";
import { VisitForm, type VisitOption } from "@/components/forms/forms";
import { Icon, Pending } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBranch(slug);
  if (!b) return {};
  return pageMetadata({
    title: `Plan a Visit to ${b.shortName} in ${b.city}, ${b.region}`,
    description: `Plan your first visit to ${b.shortName}: choose a gathering and date, and we'll send you the address, time and what to expect.`,
    path: `/branches/${b.slug}/visit`,
    ogTitle: `Plan a visit · ${b.shortName}`,
  });
}

export default async function VisitPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ g?: string }> }) {
  const { slug } = await params;
  const { g } = await searchParams;
  const base = getBranch(slug);
  if (!base) notFound();
  const b = withContent(base, await getBranchContent(slug));

  const now = new Date();
  // In-person gatherings first; next 4 dates each (PRD §6.9).
  const options: VisitOption[] = b.meetings
    .filter((m) => isActive(m) && m.day !== "Daily" && (!m.online || m.signature))
    .map((m) => ({
      gathering: m.title,
      dates: isSchedulable(m)
        ? occurrences(m, now, 4).map((o) => ({
            value: o.start.toISOString(),
            label: `${formatInZone(o.start, m.timezone, { weekday: "short", month: "short", day: "numeric" })} · ${formatInZone(o.start, m.timezone, { hour: "numeric", minute: "2-digit" })} ${tzAbbr(m.timezone, o.start)}`,
          }))
        : [],
    }));
  if (g) options.sort((a, z) => (a.gathering === g ? -1 : z.gathering === g ? 1 : 0));
  if (!options.length) options.push({ gathering: "Next gathering (the team will confirm)", dates: [] });
  const expect = b.ext.whatToExpect ?? defaultWhatToExpect;

  return (
    <div style={b.ext.accent ? { ["--branch" as string]: b.ext.accent } : undefined}>
      <section className="pb-20 pt-32 md:pt-40">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-muted">
              <Link href="/locations" className="hover:text-ink">
                Locations
              </Link>{" "}
              /{" "}
              <Link href={`/branches/${b.slug}`} className="hover:text-ink">
                {b.name}
              </Link>{" "}
              / <span aria-current="page">Plan a visit</span>
            </nav>
            <p className="eyebrow mb-4">Plan a visit</p>
            <h1 className="display text-[clamp(37px,5.5vw,75px)]">We&apos;d love to meet you at {b.shortName}.</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">Four quick steps. We&apos;ll email the address, time and what to expect, and let the branch team know you&apos;re coming.</p>
            <div className="mt-12 rounded-3xl border border-line bg-surface p-6 md:p-10">
              <VisitForm branch={b.slug} options={options} />
            </div>
            {b.ext.signature && !b.ext.signature.rsvpUrl && (
              <Pending className="mt-5">Orlando may prefer RSVPs through ChMeetings. Add the link and this page can hand off to it.</Pending>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-line bg-surface">
              <div className="on-night relative bg-night p-6 text-on-night">
                <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-50 blur-2xl" style={{ background: "var(--branch)" }} />
                <p className="relative text-[12px] font-bold uppercase tracking-[0.18em] text-gold">You&apos;re visiting</p>
                <p className="display relative mt-1 text-[28px]">{b.shortName}</p>
                <p className="relative mt-1 text-[14px] text-on-night-muted">{b.address}</p>
              </div>
              <ul className="divide-y divide-line px-6 text-[14px]">
                {b.meetings
                  .filter((m) => isActive(m))
                  .slice(0, 5)
                  .map((m) => (
                    <li key={m.title} className="flex justify-between gap-3 py-3">
                      <span className="font-semibold">{m.title}</span>
                      <span className="shrink-0 text-muted">
                        {m.day === "Daily" ? "Daily" : m.day.slice(0, 3)} {meetingTime(m)}
                      </span>
                    </li>
                  ))}
              </ul>
              {b.leaders[0] && (
                <div className="flex items-center gap-3 border-t border-line p-6">
                  {b.leaders[0].photo && (
                    <span className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image src={b.leaders[0].photo} alt="" fill sizes="48px" className="object-cover object-top" />
                    </span>
                  )}
                  <span className="text-[14px]">
                    <span className="block font-semibold">{b.leaders[0].name}</span>
                    <span className="text-muted">{b.leaders[0].title}</span>
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-3xl bg-surface-alt p-6">
              <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-muted">What to expect</p>
              <ul className="space-y-3">
                {expect.map((x) => (
                  <li key={x.title} className="flex gap-3 text-[14px]">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
                    <span>
                      <strong className="font-semibold">{x.title}.</strong> <span className="text-muted">{x.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
