import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Icon, PageHeader, TextLink } from "@/components/ui";
import { NetworkMap } from "@/components/map/NetworkMap";
import { QuoteBand } from "@/components/home/QuoteBand";
import { branches } from "@/content/branches";
import { coreValues, instruments, mission, networkLeaders, setMan } from "@/content/words";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About RCN North America | Our Mission, Values & Leadership",
  description:
    "Remnant Christian Network is an interdenominational ministry restoring the apostolic order of the first generation of apostles, through prayer, the Word and the breaking of bread.",
  path: "/about-us",
  ogTitle: "Striving for the rebirth of Apostolic Christianity.",
});

export default function AboutPage() {
  const leaders = branches.flatMap((b) => b.leaders.map((l) => ({ ...l, branch: b })));
  return (
    <>
      <PageHeader video="worship" kicker="About · Who we are" title="Striving for the rebirth of Apostolic Christianity." intro={site.mission}>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/locations">Find a gathering</ButtonLink>
          <ButtonLink href="/sermons" variant="night">
            Listen to sermons
          </ButtonLink>
        </div>
      </PageHeader>

      <section aria-labelledby="mission-h" className="py-20 md:py-32">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <h2 id="mission-h" className="eyebrow md:col-span-3">
            Our mission
          </h2>
          <div className="space-y-6 md:col-span-9">
            {mission.paragraphs.map((p, i) => (
              <p key={i} className={`reveal ${i === 0 ? "display text-[clamp(22px,2.7vw,36px)] leading-[1.12]" : "max-w-3xl text-lg text-ink/80"}`}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="inst-h" className="bg-surface-alt py-20 md:py-28">
        <div className="wrap">
          <p className="eyebrow mb-3">How we practice</p>
          <h2 id="inst-h" className="display mb-14 text-[clamp(31px,3.9vw,56px)]">
            Three instruments. One calling.
          </h2>
          <div className="space-y-6">
            {instruments.map((x, i) => (
              <article key={x.key} className={`reveal grid items-center gap-8 overflow-hidden rounded-3xl bg-surface md:grid-cols-2 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
                <div className="relative aspect-[16/11] md:aspect-auto md:h-full md:min-h-[380px]">
                  <Image src={x.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-8 md:p-12">
                  <p className="font-display text-[62px] font-semibold leading-none text-line-strong">0{i + 1}</p>
                  <p className="eyebrow mt-4">{x.label}</p>
                  <h3 className="display mt-2 text-[37px]">{x.title}</h3>
                  <p className="mt-4 max-w-md text-lg text-muted">{x.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <QuoteBand />

      <section aria-labelledby="values-h" className="py-20 md:py-28">
        <div className="wrap">
          <p className="eyebrow mb-3">We abide by</p>
          <h2 id="values-h" className="display mb-12 text-[clamp(31px,3.9vw,56px)]">
            Our core values.
          </h2>
          <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((v, i) => (
              <li key={v} className="reveal flex items-baseline gap-5 border-b border-line py-7 sm:pr-6" style={{ ["--d" as string]: `${i * 60}ms` }}>
                <span className="text-[14px] font-bold text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="display text-[31px]">{v}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="setman-h" className="bg-surface-alt py-20 md:py-28">
        <div className="wrap grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image src="/images/gatherings/white-suit.jpg" alt="Apostle Arome Osayi ministering" fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow mb-3">Our Set Man</p>
            <h2 id="setman-h" className="display text-[clamp(34px,4.4vw,62px)]">
              {setMan.name}
            </h2>
            <p className="mt-2 text-lg text-muted">{setMan.role}</p>
            <p className="display mt-8 text-[25px] text-accent-ink">{setMan.line}</p>
            <ul className="mt-6 space-y-2.5">
              {setMan.facts.map((f) => (
                <li key={f} className="flex gap-3">
                  <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-accent-ink" /> {f}
                </li>
              ))}
            </ul>
            <blockquote className="mt-8 border-l-2 border-accent pl-5 text-[17px] italic text-ink/80">
              {setMan.isaiah}
              <span className="mt-1 block text-[14px] not-italic text-muted">Isaiah 37:31 (KJV)</span>
            </blockquote>
            <div className="mt-8 flex flex-wrap gap-5">
              <TextLink href={site.links.aao}>Visit aromeosayi.org</TextLink>
              <TextLink href={site.links.youtube}>Messages on YouTube</TextLink>
            </div>
            <p className="mt-6 text-[12px] text-muted">Photo: aromeosayi.org</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="lead-h" className="py-20 md:py-28">
        <div className="wrap">
          <p className="eyebrow mb-3">The team</p>
          <h2 id="lead-h" className="display mb-12 text-[clamp(31px,3.9vw,56px)]">
            Leadership
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {networkLeaders.map((l) => (
              <div key={l.name} className="flex items-center gap-6 rounded-3xl border border-line bg-surface p-5">
                <span className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={l.photo} alt={l.name} fill sizes="128px" className="object-cover object-top" />
                </span>
                <span>
                  <span className="display block text-[27px]">{l.name}</span>
                  <span className="text-muted">{l.title}</span>
                </span>
              </div>
            ))}
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((l) => (
              <li key={l.name + l.branch.slug}>
                <Link href={`/branches/${l.branch.slug}`} className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 hover:border-line-strong">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                    {l.photo && <Image src={l.photo} alt={l.name} fill sizes="64px" className="object-cover object-top" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold group-hover:text-accent-ink">{l.name}</span>
                    <span className="block truncate text-[13px] text-muted">{l.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="global-h" className="on-night bg-night py-20 text-on-night md:py-28">
        <div className="wrap grid items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow mb-3">Global network</p>
            <h2 id="global-h" className="display text-[clamp(31px,3.9vw,56px)]">
              Part of RCN Global
            </h2>
            <p className="mt-4 max-w-md text-on-night-muted">
              Remnant Christian Network has churches across Nigeria, Africa, Europe and North America. RCN North America is the network hub for every branch in the United States and Canada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={site.links.rcnGlobal} variant="white">
                rcnglobal.org ↗
              </ButtonLink>
              <ButtonLink href="/locations" variant="night">
                Find a branch
              </ButtonLink>
            </div>
          </div>
          <NetworkMap tone="night" />
        </div>
      </section>
    </>
  );
}
