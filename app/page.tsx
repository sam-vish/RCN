import Image from "next/image";
import Link from "next/link";
import { LoopVideo } from "@/components/motion/LoopVideo";
import { ButtonLink, EmptyState, Icon, Pending, SectionHead, TextLink } from "@/components/ui";
import { BranchFinder } from "@/components/map/BranchFinder";
import { NetworkMap } from "@/components/map/NetworkMap";
import { GatheringTicker } from "@/components/home/GatheringTicker";
import { Carousel } from "@/components/home/Carousel";
import { WatchLatest } from "@/components/home/WatchLatest";
import { QuoteBand } from "@/components/home/QuoteBand";
import { SermonCard } from "@/components/sermons/SermonCard";
import { NextLabel } from "@/components/branch/NextGathering";
import { PlayTrigger } from "@/components/motion/VideoModal";
import { branches, featuredSlugs } from "@/content/branches";
import { instruments, networkLeaders, emptyStates } from "@/content/words";
import { site } from "@/content/site";
import { formatEventDate, pastGatherings } from "@/content/events";
import { getEvents } from "@/lib/events";
import { formatDate, formatDuration, getLibrary } from "@/lib/sermons";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 1800;

export const metadata = pageMetadata({
  title: "RCN North America | Apostolic Churches Across the US & Canada",
  absolute: true,
  description:
    "Remnant Christian Network North America: striving for the rebirth of Apostolic Christianity. Find an RCN branch near you, plan a visit, and watch messages from Apostle Arome Osayi.",
  path: "/",
});

export default async function Home() {
  const [library, events] = await Promise.all([getLibrary(), getEvents()]);
  const latest = library.filter((s) => s.speaker === "Apostle Arome Osayi").slice(0, 7);
  const [feature, ...recent] = latest;
  const pointmen = branches
    .flatMap((b) => b.leaders.filter((l) => /point/i.test(l.title)).map((l) => ({ ...l, branch: b })))
    .sort((a, b) => (featuredSlugs.includes(b.branch.slug) ? 1 : 0) - (featuredSlugs.includes(a.branch.slug) ? 1 : 0));
  const ordered = [...branches].sort((a, b) => (featuredSlugs.includes(b.slug) ? 1 : 0) - (featuredSlugs.includes(a.slug) ? 1 : 0));

  return (
    <>
      {/* 1 · Hero */}
      <section className="on-night relative flex min-h-[100svh] items-end overflow-hidden bg-night text-on-night">
        <div className="parallax absolute inset-0">
          <LoopVideo name="hero" mobileName="hero-mobile" priority className="absolute inset-0" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/35 to-night/10" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-night/60 via-night/10 to-transparent" />
        <div className="wrap relative z-10 pb-12 pt-36 md:pb-20">
          <p className="eyebrow rise mb-6">Remnant Christian Network · North America</p>
          <h1 className="display rise max-w-[15ch] text-[clamp(41px,6.7vw,103px)]" style={{ ["--d" as string]: "80ms" }}>
            Striving for the rebirth of Apostolic Christianity.
          </h1>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-end">
            <div className="rise" style={{ ["--d" as string]: "160ms" }}>
              <p className="max-w-xl text-lg text-on-night/85 md:text-xl">{site.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/locations">
                  Find a gathering
                  <Icon name="pin" className="h-4 w-4" />
                </ButtonLink>
                {feature && <WatchLatest id={feature.id} title={feature.title} />}
              </div>
            </div>
            <div className="rise" style={{ ["--d" as string]: "240ms" }}>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-on-night/70">Find your nearest branch</p>
              <BranchFinder tone="night" />
            </div>
          </div>
          <p className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-on-night/55">
            <span>On screen: Marching Orders 2026 and RCN Boston, from RCN&apos;s own livestreams.</span>
            <Pending tone="night">replace with original b-roll from the media team</Pending>
          </p>
        </div>
      </section>

      {/* Live ticker of the next gatherings across branches */}
      <GatheringTicker />

      {/* 2 · Mission */}
      <section className="py-24 md:py-36">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <p className="eyebrow reveal md:col-span-3">Our mission</p>
          <div className="md:col-span-9">
            <p className="display reveal text-[clamp(25px,3.4vw,50px)] leading-[1.04]">
              An interdenominational ministry restoring the order of the first generation of apostles —{" "}
              <em className="text-accent-ink">through prayer, the Word, and fellowship.</em>
            </p>
            <div className="reveal mt-10 flex flex-wrap items-center gap-6" style={{ ["--d" as string]: "120ms" }}>
              <TextLink href="/about-us">Read more about RCN</TextLink>
              <span className="text-[15px] text-muted">13 branches · United States &amp; Canada · Part of RCN Global</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · Three instruments */}
      <section aria-labelledby="instruments" className="pb-24 md:pb-36">
        <div className="wrap">
          <SectionHead eyebrow="How we practice" title={<span id="instruments">Three instruments. One calling.</span>} className="reveal mb-14" />
          <ol className="grid gap-6 md:grid-cols-3">
            {instruments.map((x, i) => (
              <li key={x.key} className="reveal group" style={{ ["--d" as string]: `${i * 120}ms` }}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-night">
                  <Image src={x.image} alt="" fill sizes="(min-width: 768px) 30vw, 92vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" quality={75} />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
                  <div className="on-night absolute inset-x-0 bottom-0 p-7 text-on-night">
                    <p className="font-display text-[50px] font-semibold leading-none text-on-night/25">0{i + 1}</p>
                    <p className="eyebrow mt-2">{x.label}</p>
                    <h3 className="display mt-2 text-[31px]">{x.title}</h3>
                  </div>
                </div>
                <p className="mt-5 px-1 text-[16px] text-muted">{x.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[12px] text-muted">Photos: RCN gatherings, from the current rcnnorthamerica.com.</p>
        </div>
      </section>

      {/* 4 · Recent messages */}
      {feature && (
        <section aria-labelledby="messages" className="on-night bg-night py-24 text-on-night md:py-32">
          <div className="wrap">
            <SectionHead
              eyebrow="Teaching archive"
              title={<span id="messages">Recent messages</span>}
              intro={<span className="text-on-night-muted">Search the full library or browse what just dropped.</span>}
              action={<TextLink href="/sermons" tone="night">Open the full sermon library</TextLink>}
              className="reveal mb-12"
            />
            <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
              <PlayTrigger id={feature.id} title={feature.title} className="reveal group block">
                <div className="relative aspect-video overflow-hidden rounded-3xl bg-night-2">
                  <Image src={`https://i.ytimg.com/vi/${feature.id}/maxresdefault.jpg`} alt="" fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" quality={75} />
                  <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-white shadow">Watch the latest</span>
                  <span className="absolute bottom-5 right-5 grid h-16 w-16 place-items-center rounded-full bg-on-night text-night shadow-xl transition-transform group-hover:scale-110">
                    <Icon name="play" className="ml-1 h-7 w-7" />
                  </span>
                </div>
                <p className="display mt-6 text-[clamp(23px,2.5vw,36px)] group-hover:text-gold">{feature.title}</p>
                <p className="mt-2 text-[15px] text-on-night-muted">
                  {feature.speaker} · {formatDate(feature.date)}
                  {feature.duration ? ` · ${formatDuration(feature.duration)}` : ""}
                </p>
              </PlayTrigger>
              <ul className="grid gap-6 sm:grid-cols-2">
                {recent.slice(0, 4).map((s, i) => (
                  <li key={s.id} className="reveal" style={{ ["--d" as string]: `${i * 80}ms` }}>
                    <SermonCard tone="night" s={{ id: s.id, title: s.title, speaker: s.speaker, date: formatDate(s.date), duration: formatDuration(s.duration) }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 5 · Find a branch: network map + list */}
      <section aria-labelledby="branches" className="py-24 md:py-32">
        <div className="wrap">
          <SectionHead
            eyebrow="Find a branch"
            title={<span id="branches">One family, thirteen cities.</span>}
            intro="Every branch gathers around the same instruments: prayer, the Word and the breaking of bread. Pick the one nearest you."
            action={<ButtonLink href="/locations" variant="ghost">Browse all locations</ButtonLink>}
            className="reveal mb-10"
          />
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <div className="relative overflow-hidden rounded-[28px] bg-night p-3 md:p-6 lg:sticky lg:top-28">
              <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(60% 60% at 60% 45%, rgba(223,101,38,0.25), transparent)" }} />
              <NetworkMap tone="night" className="relative" />
              <p className="on-night relative px-3 pb-2 text-[12px] text-on-night-muted">Headquarters: {site.hq.address}</p>
            </div>
            <ul className="divide-y divide-line rounded-[28px] border border-line bg-surface">
              {ordered.map((b) => (
                <li key={b.slug}>
                  <Link href={`/branches/${b.slug}`} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-surface-alt">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold group-hover:text-accent-ink">
                        {b.shortName}
                        {b.isHQ && <span className="ml-2 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">HQ</span>}
                      </span>
                      <span className="block truncate text-[13px] text-muted">
                        {b.city}, {b.region} · <NextLabel slug={b.slug} />
                      </span>
                    </span>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-ink" aria-hidden>
                      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6 · Events */}
      <section aria-labelledby="events" className="bg-surface-alt py-24 md:py-32">
        <div className="wrap">
          <SectionHead
            eyebrow="Upcoming"
            title={<span id="events">Conferences &amp; gatherings</span>}
            action={<TextLink href="/events">All events</TextLink>}
            className="reveal mb-10"
          />
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {events.filter((e) => !e.sample).length === 0 && (
              <EmptyState title="Nothing on the calendar just yet." body={emptyStates.events.replace("Nothing on the calendar just yet. ", "")}>
                <ButtonLink href="#newsletter" variant="ghost">Join the newsletter</ButtonLink>
              </EmptyState>
            )}
            {events
              .filter((e) => e.sample)
              .map((e) => (
                <Link key={e.slug} href={`/events/${e.slug}`} className="on-night group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl bg-night p-7 text-on-night">
                  <LoopVideo name="conference" className="absolute inset-0 opacity-70 transition-opacity group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
                  <div className="relative">
                    <span className="rounded-full border border-gold/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">Sample · {formatEventDate(e)}</span>
                    <p className="display mt-4 text-[34px]">{e.title}</p>
                    <p className="mt-2 max-w-md text-[15px] text-on-night-muted">The flagship national conference. Watch past sessions; next dates coming soon.</p>
                  </div>
                </Link>
              ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pastGatherings.map((p) => (
              <PlayTrigger key={p.slug} id={p.videos[0].id} title={`${p.title}: ${p.videos[0].label}`} className="group flex gap-4 rounded-2xl border border-line bg-surface p-3 hover:border-line-strong">
                <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl">
                  <Image src={`https://i.ytimg.com/vi/${p.videos[0].id}/mqdefault.jpg`} alt="" fill sizes="128px" className="object-cover" />
                </span>
                <span className="min-w-0 py-1">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Past · {formatEventDate(p)}</span>
                  <span className="mt-1 block font-semibold leading-snug group-hover:text-accent-ink">{p.title}</span>
                </span>
              </PlayTrigger>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Leadership */}
      <section aria-labelledby="leadership" className="py-24 md:py-32">
        <div className="wrap">
          <SectionHead eyebrow="The team" title={<span id="leadership">Leadership</span>} intro="The men and women serving the network across North America." className="reveal mb-12" />
          <div className="grid gap-6 md:grid-cols-2">
            {networkLeaders.map((l, i) => (
              <div key={l.name} className="reveal group grid grid-cols-[120px_1fr] items-center gap-6 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-[180px_1fr]" style={{ ["--d" as string]: `${i * 100}ms` }}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-alt">
                  <Image src={l.photo} alt={l.name} fill sizes="180px" className="object-cover object-top" />
                </div>
                <div>
                  <p className="display text-[clamp(22px,2.3vw,31px)]">{l.name}</p>
                  <p className="mt-1 text-muted">{l.title}</p>
                  {i === 0 && <TextLink href={site.links.aao} className="mt-4">aromeosayi.org</TextLink>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <div className="flex items-end justify-between gap-6">
              <h3 className="display text-[28px]">Meet the Pointmen</h3>
            </div>
            <Carousel label="pointmen">
              {pointmen.map((l) => (
                <li key={l.name} className="w-[220px] shrink-0 snap-start md:w-[250px]">
                  <Link href={`/branches/${l.branch.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-alt">
                      {l.photo && <Image src={l.photo} alt={l.name} fill sizes="250px" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />}
                    </div>
                    <p className="mt-3 font-semibold leading-tight group-hover:text-accent-ink">{l.name}</p>
                    <p className="text-[14px] text-muted">{l.title}</p>
                  </Link>
                </li>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* 8 · Lead Pastor quote */}
      <QuoteBand />

      {/* 9 · Get involved */}
      <section aria-labelledby="involved" className="py-24 md:py-32">
        <div className="wrap">
          <SectionHead eyebrow="Come as you are" title={<span id="involved">Get involved</span>} className="reveal mb-12" />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { href: "/locations", icon: "pin", title: "Plan a visit", body: "Pick a branch and a gathering. We'll send the address, the time and what to expect, and someone will look out for you." },
              { href: "/serve", icon: "users", title: "Serve", body: "Worship, protocol, hospitality, children, media, and the tech & systems team behind the network." },
              { href: "/giving", icon: "heart", title: "Give", body: "Partner with the gospel in North America, nationally or through your own branch." },
            ].map((c, i) => (
              <Link key={c.href} href={c.href} className="reveal group relative overflow-hidden rounded-3xl border border-line bg-surface p-8 transition-colors hover:border-accent/50" style={{ ["--d" as string]: `${i * 100}ms` }}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/12 text-accent-ink transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon name={c.icon} className="h-6 w-6" />
                </span>
                <p className="display mt-8 text-[31px]">{c.title}</p>
                <p className="mt-3 text-muted">{c.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent-ink">
                  Start here
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden>
                    <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
