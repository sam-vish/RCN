import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { branches, getBranch, nearbyBranches } from "@/content/branches";
import { defaultWhatToExpect } from "@/content/words";
import { formatEventDate } from "@/content/events";
import { getEvents } from "@/lib/events";
import { branchSermons, formatDate, formatDuration } from "@/lib/sermons";
import { branchJsonLd, pageMetadata } from "@/lib/seo";
import { getBranchContent, withContent } from "@/lib/branch-content";
import { LoopVideo } from "@/components/motion/LoopVideo";
import { JsonLd } from "@/components/layout/JsonLd";
import { BranchLockup } from "@/components/layout/Brand";
import { ButtonLink, EmptyState, Icon, Pending, PlaceholderMedia, TextLink } from "@/components/ui";
import { MapView } from "@/components/map/MapView";
import { SermonCard } from "@/components/sermons/SermonCard";
import { ContactForm, ServeForm } from "@/components/forms/forms";
import { Countdown, NextGatheringCard } from "@/components/branch/NextGathering";
import { BranchNav } from "@/components/branch/BranchNav";
import { BranchSection, LeaderGrid, MeetingTimes, NearbyStrip, Overview, SocialButtons, directionsUrl, mapsUrl } from "@/components/branch/sections";

export const revalidate = 1800;

export function generateStaticParams() {
  return branches.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBranch(slug);
  if (!b) return {};
  return pageMetadata({
    // PRD §8 pattern: "RCN Boston | Apostolic Church in Littleton, MA | RCN North America"
    title: `${b.shortName} | Apostolic Church in ${b.city}, ${b.region} | RCN North America`,
    absolute: true,
    description: `${b.description} Meeting times, directions, leadership and how to plan your first visit to ${b.shortName}, ${b.address}.`,
    path: `/branches/${b.slug}`,
    ogTitle: b.shortName,
    ogSub: `${b.city}, ${b.region} · Remnant Christian Network`,
    ogImage: b.ext.heroVideo === "boston" ? "boston" : b.ext.heroVideo === "orlando" ? "orlando" : "hero",
  });
}

export default async function BranchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const base = getBranch(slug);
  if (!base) notFound();
  // Leader edits from /admin (Supabase `branch_content`) override the static defaults.
  const b = withContent(base, await getBranchContent(slug));
  const ext = b.ext;
  const [sermons, events] = await Promise.all([branchSermons(b.slug, 6), getEvents()]);
  const branchEvents = events.filter((e) => e.branch === b.slug);
  const nearby = nearbyBranches(b, 3);
  const expect = ext.whatToExpect ?? defaultWhatToExpect;
  const accentStyle = ext.accent ? { ["--branch" as string]: ext.accent, ["--branch-ink" as string]: ext.accent } : {};
  const sig = ext.signature;

  const nav = [
    { id: "times", label: "Times" },
    sig && { id: "gathering", label: sig.name.split(" ").slice(0, 2).join(" ") },
    ext.weeklyClasses && { id: "classes", label: "Classes" },
    { id: "expect", label: "First visit" },
    { id: "leaders", label: "Leaders" },
    { id: "location", label: "Location" },
    { id: "messages", label: "Messages" },
    (ext.kids || ext.serveDepartments) && { id: "family", label: "Kids & serve" },
    { id: "connect", label: "Connect" },
    { id: "give", label: "Give" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div style={accentStyle}>
      <JsonLd data={branchJsonLd(b)} />

      {/* 1 · Hero */}
      <section className="on-night relative flex min-h-[92svh] items-end overflow-hidden bg-night text-on-night">
        {ext.heroVideo ? (
          <div className="parallax absolute inset-0">
            <LoopVideo name={ext.heroVideo} priority className="absolute inset-0" />
          </div>
        ) : ext.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ext.heroImage} alt="" fetchPriority="high" className="parallax absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0">
            <div aria-hidden className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(70% 60% at 70% 30%, rgba(223,101,38,0.35), transparent), radial-gradient(50% 50% at 10% 90%, rgba(200,146,95,0.25), transparent)" }} />
            <div className="absolute right-[var(--gutter)] top-28 hidden w-[min(38vw,520px)] md:block">
              <PlaceholderMedia tone="night" label={`${b.shortName} photo coming soon`} className="aspect-[4/3]">
                <p className="mt-2 text-[12px] opacity-80">A real photo of this branch gathering goes here.</p>
              </PlaceholderMedia>
            </div>
          </div>
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/40 to-night/5" />
        <div className="wrap relative z-10 pb-14 pt-36 md:pb-20">
          <nav aria-label="Breadcrumb" className="rise mb-6 text-[13px] text-on-night/70">
            <Link href="/locations" className="hover:text-white">
              Locations
            </Link>{" "}
            / <span aria-current="page">{b.name}</span>
          </nav>
          {ext.logoWord && <BranchLockup word={ext.logoWord} accent={ext.accent} className="rise mb-6" />}
          <h1 className="display rise text-[clamp(47px,8.6vw,131px)] leading-[0.98]">{b.shortName}</h1>
          <p className="rise mt-4 flex items-center gap-2 text-lg text-on-night/85 md:text-xl" style={{ ["--d" as string]: "80ms" }}>
            <Icon name="pin" className="h-5 w-5 text-accent" /> {b.city}, {b.region}
            {b.isHQ && <span className="ml-2 rounded-full border border-gold/50 px-2.5 py-0.5 text-[12px] font-bold uppercase tracking-wider text-gold">Network HQ</span>}
          </p>
          <p className="rise mt-3 max-w-2xl text-on-night-muted" style={{ ["--d" as string]: "120ms" }}>
            {b.description}
          </p>
          <div className="rise mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" style={{ ["--d" as string]: "180ms" }}>
            <NextGatheringCard slug={b.slug} />
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/branches/${b.slug}/visit`} className="!bg-branch hover:!brightness-110">
                Plan a visit
              </ButtonLink>
              <ButtonLink href={directionsUrl(b.address)} variant="night">
                Get directions ↗
              </ButtonLink>
            </div>
          </div>
          {ext.heroVideo && (
            <p className="mt-10 flex flex-wrap items-center gap-3 text-[12px] text-on-night/55">
              <span>On screen: {b.shortName}, from the branch&apos;s own livestream.</span>
              <Pending tone="night">swap for branch photos/b-roll from the media team</Pending>
            </p>
          )}
        </div>
      </section>

      <BranchNav items={nav} name={b.shortName} visitHref={`/branches/${b.slug}/visit`} />

      {/* 2 · Meeting times */}
      <BranchSection id="times" eyebrow="Weekly rhythm" title="When we gather" intro={<>All times are local to {b.city}. Cards show the time zone; the countdown above converts to yours.</>}>
        <MeetingTimes branch={b} />
      </BranchSection>

      {/* Signature gathering (Orlando's 7 Hours) */}
      {sig && (
        <section id="gathering" aria-labelledby="gathering-h" className="on-night relative scroll-mt-36 overflow-hidden bg-night py-20 text-on-night md:py-28">
          {ext.heroVideo && <LoopVideo name={ext.heroVideo} className="absolute inset-0 opacity-35" />}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-night via-night/90 to-night/60" />
          <div className="wrap relative grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="reveal">
              <p className="eyebrow mb-4">Signature gathering · last Saturday</p>
              <h2 id="gathering-h" className="display text-[clamp(37px,5.5vw,81px)] leading-[1]">
                <span className="block text-[1.4em] leading-[0.8]" style={{ color: ext.accent ? "#8fa2ff" : undefined }}>
                  7
                </span>
                Hours Apostolic Gathering
              </h2>
              {sig.altName && <p className="mt-3 text-[15px] text-on-night-muted">Also called “{sig.altName}”.</p>}
              <p className="mt-6 max-w-xl text-lg text-on-night/85">{sig.summary}</p>
              <ul className="mt-6 space-y-2.5">
                {sig.expect.map((x) => (
                  <li key={x} className="flex gap-3 text-on-night/90">
                    <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-gold" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {sig.rsvpUrl ? (
                  <ButtonLink href={sig.rsvpUrl}>RSVP on ChMeetings ↗</ButtonLink>
                ) : (
                  <span className="inline-flex min-h-12 items-center rounded-full border-2 border-dashed border-gold/60 px-6 text-[15px] font-semibold text-gold">
                    RSVP on ChMeetings · link coming
                  </span>
                )}
                <ButtonLink href={`/branches/${b.slug}/visit?g=${encodeURIComponent(sig.meetingTitle)}`} variant="night">
                  Or tell us you&apos;re coming
                </ButtonLink>
              </div>
              {sig.confirm && <Pending tone="night" className="mt-6">{sig.confirm}</Pending>}
            </div>
            <div className="reveal" style={{ ["--d" as string]: "120ms" }}>
              <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-on-night/70">Countdown to the next gathering</p>
              <Countdown slug={b.slug} title={sig.meetingTitle} />
            </div>
          </div>
        </section>
      )}

      {/* Weekly online classes (Orlando) */}
      {ext.weeklyClasses && (
        <BranchSection id="classes" eyebrow="Online through the week" title="Weekly classes" intro={ext.weeklyClasses.intro} tone="alt">
          <ul className="grid gap-4 md:grid-cols-3">
            {ext.weeklyClasses.items.map((c, i) => (
              <li key={c.title} className="reveal flex flex-col rounded-3xl border border-line bg-surface p-7" style={{ ["--d" as string]: `${i * 80}ms` }}>
                <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-muted">{c.day}</p>
                <p className="display mt-2 text-[34px]" style={{ color: "var(--branch-ink)" }}>
                  {c.title}
                </p>
                {c.summary && <p className="mt-2 text-muted">{c.summary}</p>}
                <div className="mt-auto pt-6">
                  {c.joinUrl ? (
                    <ButtonLink href={c.joinUrl} className="w-full">
                      <Icon name="video" className="h-4 w-4" /> Join online
                    </ButtonLink>
                  ) : (
                    <span className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-dashed border-line-strong text-[14px] font-semibold text-muted">
                      <Icon name="video" className="h-4 w-4" /> Time &amp; join link coming
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {ext.weeklyClasses.confirm && <Pending className="mt-6">{ext.weeklyClasses.confirm}</Pending>}
        </BranchSection>
      )}

      {/* 3 · What to expect */}
      <BranchSection id="expect" eyebrow="Your first visit" title={<>What to expect</>} intro="Come as you are. Here's what a first visit looks like.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {expect.map((x, i) => (
            <div key={x.title} className="reveal rounded-3xl border border-line bg-surface p-7" style={{ ["--d" as string]: `${i * 70}ms` }}>
              <p className="font-display text-[44px] font-semibold leading-none text-line-strong">0{i + 1}</p>
              <p className="mt-4 text-[19px] font-semibold">{x.title}</p>
              <p className="mt-2 text-[15px] text-muted">{x.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href={`/branches/${b.slug}/visit`}>Plan your visit</ButtonLink>
          {ext.whatToExpectIsDraft !== false && <Pending>Network-wide draft copy. {b.shortName} leaders to review and add branch specifics (length, greeters, dress, kids).</Pending>}
        </div>
      </BranchSection>

      {b.overview && (
        <BranchSection id="about" eyebrow={`About ${b.shortName}`} title="Who we are" tone="alt">
          <Overview lines={b.overview} />
        </BranchSection>
      )}

      {/* 4 · Leadership */}
      <BranchSection id="leaders" eyebrow="Leadership" title={b.leaders.length > 1 ? "The team" : "Your Pointman"} tone={b.overview ? "light" : "alt"}>
        <LeaderGrid branch={b} />
      </BranchSection>

      {/* 5 · Location */}
      <BranchSection id="location" eyebrow="Location" title="Find us">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="reveal flex flex-col gap-5 rounded-3xl border border-line bg-surface p-7">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-muted">Address</p>
              <p className="mt-2 text-[20px] font-semibold leading-snug">{b.address}</p>
              <p className="text-muted">
                {b.city}, {b.region}, {b.country}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={directionsUrl(b.address)}>Get directions ↗</ButtonLink>
              <ButtonLink href={mapsUrl(b.address)} variant="ghost">
                Open in Maps ↗
              </ButtonLink>
            </div>
            {ext.parking && (
              <div className="rounded-2xl bg-surface-alt p-5">
                <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-muted">Getting here</p>
                <ul className="space-y-3 text-[15px]">
                  {ext.parking.lines.map((l, i) => (
                    <li key={l} className="flex gap-3">
                      <Icon name={i === 0 ? "car" : "train"} className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                      {l}
                    </li>
                  ))}
                </ul>
                {ext.parking.confirm && <Pending className="mt-4">{ext.parking.confirm}</Pending>}
              </div>
            )}
            <div className="mt-auto space-y-2 border-t border-line pt-5 text-[15px]">
              {b.emails.map((e) => (
                <a key={e} href={`mailto:${e}`} className="flex items-center gap-3 hover:text-accent-ink">
                  <Icon name="mail" className="h-4 w-4 text-muted" /> {e}
                </a>
              ))}
              {b.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3 hover:text-accent-ink">
                  <Icon name="phone" className="h-4 w-4 text-muted" /> {p}
                </a>
              ))}
            </div>
          </div>
          <MapView points={[{ slug: b.slug, lat: b.lat, lng: b.lng, label: b.shortName, sub: b.address }]} className="reveal min-h-[380px] rounded-3xl lg:min-h-full" />
        </div>
      </BranchSection>

      {/* 6 · Events */}
      <BranchSection id="events" eyebrow="Coming up" title={`At ${b.shortName}`} tone="alt">
        {branchEvents.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {branchEvents.map((e) => (
              <li key={e.slug}>
                <Link href={`/events/${e.slug}`} className="block rounded-3xl border border-line bg-surface p-7 hover:border-line-strong">
                  <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-muted">{formatEventDate(e)}</p>
                  <p className="display mt-2 text-[27px]">{e.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No special events posted yet." body={<>The weekly gatherings above happen every week. For retreats, conferences and special meetings, join the newsletter and we&apos;ll tell you first.</>}>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/events" variant="ghost">
                Network events
              </ButtonLink>
              <ButtonLink href="#newsletter" variant="ghost">
                Join the newsletter
              </ButtonLink>
            </div>
          </EmptyState>
        )}
      </BranchSection>

      {/* 7 · Messages */}
      <BranchSection
        id="messages"
        eyebrow="Watch"
        title={`Messages from ${b.shortName}`}
        intro={b.ext.youtubeChannelId ? "Services, Bible studies and prayer gatherings, streamed from the branch's own channel." : undefined}
      >
        {sermons.length ? (
          <>
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((s) => (
                <li key={s.id}>
                  <SermonCard s={{ id: s.id, title: s.title, speaker: s.speaker, date: formatDate(s.date), duration: formatDuration(s.duration), tag: s.series }} />
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-5">
              <TextLink href={`/sermons?branch=${b.slug}`}>All {b.shortName} messages</TextLink>
              {b.socials.youtube && <TextLink href={b.socials.youtube}>{b.shortName} on YouTube</TextLink>}
            </div>
          </>
        ) : (
          <EmptyState icon="photo" title="Messages coming soon." body={<>Messages tagged to {b.shortName} will appear here. Meanwhile, the full library has over 1,000 teachings.</>}>
            <ButtonLink href="/sermons" variant="ghost">
              Open the sermon library
            </ButtonLink>
          </EmptyState>
        )}
      </BranchSection>

      {/* Kids & serve (Orlando extension) */}
      {(ext.kids || ext.serveDepartments) && (
        <BranchSection id="family" eyebrow="Family & serving" title="There's room for everyone" tone="alt">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            {ext.kids && (
              <div className="reveal relative overflow-hidden rounded-3xl bg-ink p-8 text-on-night">
                <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-2xl" style={{ background: "var(--branch)" }} />
                <p className="relative text-[13px] font-bold uppercase tracking-[0.18em] text-gold">Kids</p>
                <p className="display relative mt-3 text-[36px] leading-none">{ext.kids.title}</p>
                <ul className="relative mt-6 space-y-3">
                  {ext.kids.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-gold" /> {p}
                    </li>
                  ))}
                </ul>
                <Pending tone="night" className="relative mt-6">
                  Kids ministry details are from the brief. Confirm room names, check-in process and which gatherings have kids&apos; rooms.
                </Pending>
              </div>
            )}
            {ext.serveDepartments && (
              <div className="reveal rounded-3xl border border-line bg-surface p-7 md:p-9">
                <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-muted">Serve</p>
                <p className="display mt-2 text-[31px] leading-none">Join a department</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {ext.serveDepartments.map((d) => (
                    <li key={d} className="rounded-full border border-line-strong px-4 py-1.5 text-[14px] font-semibold">
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <ServeForm branch={b.slug} departments={ext.serveDepartments} />
                </div>
              </div>
            )}
          </div>
        </BranchSection>
      )}

      {/* 8 · Get connected */}
      <BranchSection id="connect" eyebrow="Stay in the loop" title="Get connected" tone="night">
        <SocialButtons branch={b} />
        {ext.notes && (
          <div className="mt-5 space-y-2">
            {ext.notes.map((n) => (
              <Pending key={n} tone="night">
                {n}
              </Pending>
            ))}
          </div>
        )}
        {!b.socials.telegram && (
          <p className="mt-6 text-[14px] text-on-night-muted">
            Prefer Telegram? Follow the Apostle&apos;s channel at{" "}
            <a href="https://t.me/Apostlearome" target="_blank" rel="noopener noreferrer" className="font-semibold text-gold underline-offset-4 hover:underline">
              t.me/Apostlearome
            </a>
            .
          </p>
        )}
      </BranchSection>

      {/* 9 + 10 · Prayer/contact + Give */}
      <section id="give" aria-label="Contact and giving" className="scroll-mt-36 py-20 md:py-28">
        <div className="wrap grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="reveal rounded-3xl border border-line bg-surface p-7 md:p-10">
            <p className="eyebrow mb-3" style={{ color: "var(--branch-ink, var(--accent-ink))" }}>
              Prayer &amp; contact
            </p>
            <h2 className="display text-[34px]">Write to {b.shortName}</h2>
            <p className="mt-2 mb-7 text-muted">Questions, prayer needs, anything. It goes straight to the branch team.</p>
            <ContactForm branch={b.slug} />
          </div>
          <div className="reveal on-night relative flex flex-col overflow-hidden rounded-3xl bg-night p-7 text-on-night md:p-10" style={{ ["--d" as string]: "100ms" }}>
            <div aria-hidden className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-50 blur-3xl" style={{ background: "var(--branch)" }} />
            <p className="eyebrow relative mb-3">Give</p>
            <h2 className="display relative text-[34px] leading-none">Partner with {b.shortName}</h2>
            <p className="relative mt-3 text-on-night-muted">Give to this branch or to RCN North America. Every branch has its own giving page.</p>
            <div className="relative mt-auto flex flex-col gap-3 pt-8">
              <ButtonLink href={`/giving?branch=${b.slug}`} variant="white">
                Give to {b.shortName}
              </ButtonLink>
              <ButtonLink href="/giving" variant="night">
                Give to RCN North America
              </ButtonLink>
              {ext.givingConfirm && (
                <Pending tone="night" className="mt-2">
                  {ext.givingConfirm}
                </Pending>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 11 · Nearby */}
      <section aria-labelledby="nearby-h" className="border-t border-line bg-surface-alt py-16">
        <div className="wrap">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="nearby-h" className="display text-[28px]">
              Other branches nearby
            </h2>
            <TextLink href="/locations">All 13 locations</TextLink>
          </div>
          <NearbyStrip items={nearby} />
        </div>
      </section>
    </div>
  );
}
