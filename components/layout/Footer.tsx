import Link from "next/link";
import { footerCredit, moreNav, primaryNav, site, socials } from "@/content/site";
import { getBranch } from "@/content/branches";
import { meetingTime, tzAbbr } from "@/lib/schedule";
import { RcnLogo } from "./Brand";
import { Pending, SocialIconLink } from "@/components/ui";
import { NewsletterForm } from "@/components/forms/forms";

export function Footer() {
  const hq = getBranch(site.hq.slug)!;
  return (
    <footer className="on-night relative overflow-hidden bg-night text-on-night">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[680px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(closest-side,#df6526,transparent)" }} />
      <div id="newsletter" className="wrap relative scroll-mt-24 border-b border-on-night/10 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="eyebrow mb-4">Stay close</p>
            <p className="display text-[clamp(28px,3.6vw,50px)]">News from the network, first.</p>
            <p className="mt-3 max-w-xl text-on-night-muted">Conferences, branch gatherings and new messages. A letter now and then, never spam.</p>
          </div>
          <NewsletterForm source="footer" tone="night" />
        </div>
      </div>

      <div className="wrap relative grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <RcnLogo tone="night" />
          <p className="mt-5 max-w-sm text-[15px] text-on-night-muted">{site.intro}</p>
          <ul className="mt-6 flex gap-1 text-on-night/85">
            {socials.map((s) => (
              <li key={s.name}>
                <SocialIconLink href={s.href} icon={s.icon} label={s.name} className="hover:bg-on-night/10 hover:text-gold" />
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Explore" className="md:col-span-2">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-gold">Explore</p>
          <ul className="space-y-2.5 text-[15px]">
            {[...primaryNav, { href: "/giving", label: "Give" }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-on-night/85 hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More" className="md:col-span-2">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-gold">More</p>
          <ul className="space-y-2.5 text-[15px]">
            {moreNav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-on-night/85 hover:text-white" {...(n.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/team" className="text-on-night/60 hover:text-white">
                Team login
              </Link>
            </li>
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-gold">Headquarters</p>
          <p className="font-display text-2xl font-semibold">{site.hq.name}</p>
          <p className="mt-1 text-[15px] text-on-night-muted">{site.hq.address}</p>
          <ul className="mt-4 space-y-1.5 text-[15px]">
            {hq.meetings.map((m) => (
              <li key={m.title} className="flex justify-between gap-4 border-b border-on-night/10 pb-1.5">
                <span>{m.title}</span>
                <span className="text-on-night/80">
                  {meetingTime(m)} {tzAbbr(m.timezone)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold">
            <a href={site.links.aao} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-white">
              Visit aromeosayi.org ↗
            </a>
            <a href={site.links.rcnGlobal} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-white">
              RCN Global ↗
            </a>
          </div>
        </div>
      </div>

      <div className="wrap relative flex flex-col gap-3 border-t border-on-night/10 py-6 text-[13px] text-on-night-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.legalName}. All rights reserved.
        </p>
        <p className="flex flex-wrap items-center gap-3">
          <span>{footerCredit}</span>
          <Pending tone="night">footer credit approval from Minister Mica-El</Pending>
        </p>
      </div>
    </footer>
  );
}
