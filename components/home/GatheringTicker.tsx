"use client";

import Link from "next/link";
import { branches } from "@/content/branches";
import { formatInZone, nextGathering, tzAbbr } from "@/lib/schedule";
import { relative, useNow } from "@/components/branch/NextGathering";
import { useSchedules } from "@/lib/useSchedules";

/** "Happening now / next" across every branch, soonest first. Pauses on hover/focus. */
export function GatheringTicker() {
  const now = useNow(60000);
  const schedules = useSchedules();
  const items = now
    ? branches
        .map((b) => ({ b, occ: nextGathering({ meetings: schedules[b.slug] ?? b.meetings }, now) }))
        .filter((x) => x.occ)
        .sort((a, z) => a.occ!.start.getTime() - z.occ!.start.getTime())
    : [];
  return (
    <section aria-label="Next gatherings across the network" className="ticker relative overflow-hidden border-y border-line bg-surface">
      <div className="flex items-stretch">
        <p className="relative z-10 flex shrink-0 items-center gap-2 bg-ink px-4 text-[12px] font-bold uppercase tracking-[0.18em] text-on-night md:px-6">
          <span className="live-dot h-2 w-2 rounded-full bg-accent" aria-hidden />
          This week
        </p>
        <div className="min-w-0 flex-1 overflow-hidden">
          {items.length ? (
            <ul className="ticker-track flex w-max">
              {[...items, ...items].map(({ b, occ }, i) => (
                <li key={`${b.slug}-${i}`} aria-hidden={i >= items.length ? true : undefined} className="shrink-0">
                  <Link
                    href={`/branches/${b.slug}`}
                    tabIndex={i >= items.length ? -1 : undefined}
                    className="flex items-center gap-2 whitespace-nowrap px-6 py-3.5 text-[14px] hover:text-accent-ink"
                  >
                    <strong className="font-semibold">{b.shortName}</strong>
                    <span className="text-muted">
                      {occ!.meeting.title} · {formatInZone(occ!.start, occ!.meeting.timezone, { weekday: "short", hour: "numeric", minute: "2-digit" })}{" "}
                      {tzAbbr(occ!.meeting.timezone, occ!.start)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${occ!.live ? "bg-accent text-white" : "bg-surface-alt text-ink/80"}`}>
                      {occ!.live ? "Live now" : relative(occ!.start, now!)}
                    </span>
                    <span aria-hidden className="ml-4 text-line-strong">
                      ✦
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-3.5 text-[14px] text-muted">Gatherings in 13 cities across the United States and Canada.</p>
          )}
        </div>
      </div>
    </section>
  );
}
