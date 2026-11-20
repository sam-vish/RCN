import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Branch, Meeting } from "@/content/types";
import { isActive, meetingTime, recurrenceLabel, tzAbbr } from "@/lib/schedule";
import { Icon, Pending, PlaceholderMedia } from "@/components/ui";

export function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** Section wrapper with an id for the in-page nav, and a consistent heading. */
export function BranchSection({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "light",
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  tone?: "light" | "alt" | "night";
  className?: string;
}) {
  const bg = tone === "night" ? "on-night bg-night text-on-night" : tone === "alt" ? "bg-surface-alt" : "";
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`scroll-mt-36 py-20 md:py-28 ${bg} ${className}`}>
      <div className="wrap">
        <div className="reveal mb-10 max-w-3xl md:mb-14">
          <p className="eyebrow mb-4" style={tone === "night" ? undefined : { color: "var(--branch-ink, var(--accent-ink))" }}>
            {eyebrow}
          </p>
          <h2 id={`${id}-h`} className="display text-[clamp(30px,3.9vw,50px)]">
            {title}
          </h2>
          {intro && <div className={`mt-4 text-lg ${tone === "night" ? "text-on-night-muted" : "text-muted"}`}>{intro}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

const DAY_SHORT: Record<string, string> = { Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Daily: "Daily" };

export function MeetingCard({ m, slug, index }: { m: Meeting; slug: string; index: number }) {
  const icsable = Boolean(m.start) && ["weekly", "daily", "nth"].includes(m.recurrence.kind);
  return (
    <li className={`reveal relative flex flex-col rounded-3xl border bg-surface p-6 ${m.signature ? "border-branch/50" : "border-line"}`} style={{ ["--d" as string]: `${index * 70}ms` }}>
      <div className="flex items-start justify-between gap-4">
        <span className="display text-[34px] leading-none" style={{ color: "var(--branch-ink, var(--accent-ink))" }}>
          {DAY_SHORT[m.day]}
        </span>
        <span className="flex flex-wrap justify-end gap-1.5">
          {m.signature && <span className="rounded-full bg-branch px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">Signature</span>}
          {m.online && <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/80">Online</span>}
        </span>
      </div>
      <p className="mt-5 text-[19px] font-semibold leading-snug">{m.title}</p>
      <p className="mt-1 text-[15px] text-muted">{recurrenceLabel(m)}</p>
      <p className="mt-4 flex items-center gap-2 text-[17px] font-semibold">
        <Icon name="clock" className="h-4 w-4 text-muted" />
        {meetingTime(m)}
        {m.start && <span className="font-medium text-muted">{tzAbbr(m.timezone)}</span>}
      </p>
      {m.note && !recurrenceLabel(m).toLowerCase().startsWith(m.note.toLowerCase().replace(/ of every month| of the month/, "")) && <p className="mt-2 text-[14px] text-muted">{m.note}</p>}
      {m.online && (m.online.url || m.online.meetingId) && (
        <div className="mt-3 rounded-xl bg-surface-alt px-3.5 py-2.5 text-[14px]">
          {m.online.url && (
            <a href={m.online.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-ink underline-offset-4 hover:underline">
              Join on Zoom ↗
            </a>
          )}
          {m.online.meetingId && <p>Meeting ID: {m.online.meetingId}</p>}
          {m.online.passcode && <p>Passcode: {m.online.passcode}</p>}
        </div>
      )}
      {m.confirm && <Pending className="mt-3">{m.confirm}</Pending>}
      {icsable && (
        <a href={`/branches/${slug}/calendar?m=${index}`} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-semibold text-ink/80 hover:text-accent-ink">
          <Icon name="calendar" className="h-4 w-4" /> Add to calendar
        </a>
      )}
    </li>
  );
}

export function MeetingTimes({ branch }: { branch: Branch }) {
  const list = branch.meetings.map((m, i) => ({ m, i })).filter(({ m }) => isActive(m));
  if (!list.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong bg-surface p-8">
        <p className="display text-3xl">Meeting times coming soon.</p>
        <p className="mt-2 text-muted">
          The {branch.shortName} team is setting its weekly rhythm. Write to{" "}
          {branch.emails[0] ? (
            <a className="font-semibold text-accent-ink underline" href={`mailto:${branch.emails[0]}`}>
              {branch.emails[0]}
            </a>
          ) : (
            "the branch"
          )}{" "}
          for the next gathering, or join the WhatsApp group below.
        </p>
      </div>
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(({ m, i }) => (
        <MeetingCard key={`${m.title}-${i}`} m={m} slug={branch.slug} index={i} />
      ))}
    </ul>
  );
}

export function LeaderGrid({ branch }: { branch: Branch }) {
  const [lead, ...team] = branch.leaders;
  if (!lead) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <figure className="reveal">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-alt">
          {lead.photo ? (
            <Image src={lead.photo} alt={lead.name} fill sizes="(min-width: 1024px) 420px, 92vw" className="object-cover object-top" />
          ) : (
            <PlaceholderMedia label="Portrait coming soon" className="h-full" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-6 pt-20 text-on-night">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-gold">{lead.title}</p>
            <p className="display mt-1 text-[30px]">{lead.name}</p>
          </div>
        </div>
      </figure>
      {team.length > 0 ? (
        <ul className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((l, i) => (
            <li key={l.name} className="reveal flex items-center gap-4 rounded-2xl border border-line bg-surface p-3" style={{ ["--d" as string]: `${i * 60}ms` }}>
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                {l.photo && <Image src={l.photo} alt={l.name} fill sizes="80px" className="object-cover object-top" />}
              </span>
              <span>
                <span className="block font-semibold leading-tight">{l.name}</span>
                <span className="block text-[14px] text-muted">{l.title}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="reveal flex flex-col justify-center rounded-3xl border border-line bg-surface p-8">
          <p className="display text-[25px] leading-tight">
            Led locally, <em style={{ color: "var(--branch-ink, var(--accent-ink))" }}>connected nationally.</em>
          </p>
          <p className="mt-3 max-w-lg text-muted">
            {branch.shortName} is one of thirteen RCN branches across North America, under the Lead Pastor of RCN North America, Reverend Philip Gbir, and the Set Man of
            Remnant Christian Network, Apostle Arome Osayi.
          </p>
          <PlaceholderMedia label="Branch team photos coming soon" className="mt-6 min-h-[140px]" />
        </div>
      )}
    </div>
  );
}

/** Branch long-form copy from its live page ("## " headings, "- " list items). */
export function Overview({ lines }: { lines: string[] }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = (k: number) => {
    if (!list.length) return;
    out.push(
      <ul key={`l${k}`} className="my-5 grid gap-3 sm:grid-cols-2">
        {list.map((x) => {
          const [head, ...rest] = x.split(" — ");
          return (
            <li key={x} className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-semibold">{head}</p>
              {rest.length > 0 && <p className="mt-1 text-[15px] text-muted">{rest.join(" — ")}</p>}
            </li>
          );
        })}
      </ul>,
    );
    list = [];
  };
  lines.forEach((l, i) => {
    if (l.startsWith("- ")) return void list.push(l.slice(2));
    flush(i);
    if (l.startsWith("## ")) out.push(<h3 key={i} className="display mt-10 text-[27px] first:mt-0">{l.slice(3)}</h3>);
    else out.push(<p key={i} className="mt-4 max-w-3xl text-[17px] text-ink/85">{l}</p>);
  });
  flush(lines.length);
  return <div className="reveal">{out}</div>;
}

export function SocialButtons({ branch }: { branch: Branch }) {
  const s = branch.socials;
  const items = [
    s.whatsapp && { href: s.whatsapp, icon: "whatsapp", label: "WhatsApp group", sub: "Announcements & community" },
    s.telegram && { href: s.telegram, icon: "telegram", label: "Telegram", sub: "Join the channel" },
    s.youtube && { href: s.youtube, icon: "youtube", label: "YouTube", sub: "Services & livestreams" },
    s.instagram && { href: s.instagram, icon: "instagram", label: "Instagram", sub: "Photos & updates" },
    s.facebook && { href: s.facebook, icon: "facebook", label: "Facebook", sub: "Events & community" },
  ].filter(Boolean) as { href: string; icon: string; label: string; sub: string }[];
  if (!items.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((x, i) => (
        <li key={x.href} className="reveal" style={{ ["--d" as string]: `${i * 60}ms` }}>
          <a
            href={x.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full items-center gap-4 rounded-2xl border border-on-night/15 bg-on-night/[0.04] p-5 transition-colors hover:border-on-night/40 hover:bg-on-night/[0.08]"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-on-night text-night transition-colors group-hover:bg-branch group-hover:text-white">
              <Icon name={x.icon} className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold">{x.label} ↗</span>
              <span className="block text-[13px] text-on-night-muted">{x.sub}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function NearbyStrip({ items }: { items: { b: Branch; km: number }[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {items.map(({ b, km }) => (
        <li key={b.slug}>
          <Link href={`/branches/${b.slug}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 hover:border-line-strong">
            <span>
              <span className="block font-semibold group-hover:text-accent-ink">{b.shortName}</span>
              <span className="block text-[14px] text-muted">
                {b.city}, {b.region} · {Math.round(km * 0.621371).toLocaleString()} mi away
              </span>
            </span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1" aria-hidden>
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}
