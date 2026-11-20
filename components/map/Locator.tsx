"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { branches } from "@/content/branches";
import { meetingTime, recurrenceLabel, tzAbbr, isActive } from "@/lib/schedule";
import { Icon } from "@/components/ui";
import { NextLabel } from "@/components/branch/NextGathering";
import { MapView } from "./MapView";
import { formatDistance, useBranchSearch } from "./useBranchSearch";
import { useSchedules } from "@/lib/useSchedules";

const points = branches.map((b) => ({ slug: b.slug, lat: b.lat, lng: b.lng, label: b.shortName, sub: `${b.city}, ${b.region}` }));

/** /locations: search by city/ZIP, "Nearest to me", map + list, side panel per branch (PRD §6 / live site parity). */
export function Locator() {
  const s = useBranchSearch();
  const [selected, setSelected] = useState<string | null>(null);
  const schedules = useSchedules();
  const selBase = branches.find((b) => b.slug === selected);
  const sel = selBase && { ...selBase, meetings: schedules[selBase.slug] ?? selBase.meetings };

  return (
    <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
      <div className="flex min-h-0 flex-col">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            s.search(s.query);
          }}
          className="flex items-center gap-2 rounded-full border border-line-strong bg-surface p-1.5 pl-5"
        >
          <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
          <label htmlFor="loc-q" className="sr-only">
            City, state or ZIP
          </label>
          <input id="loc-q" value={s.query} onChange={(e) => s.setQuery(e.target.value)} placeholder="City, state or ZIP" className="min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none placeholder:text-muted/80" />
          <button type="submit" className="btn-accent h-10 shrink-0 rounded-full px-5 text-[14px] font-semibold">
            {s.status === "searching" ? "…" : "Search"}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={s.locate} className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[14px] font-semibold hover:border-ink">
            <Icon name="locate" className="h-4 w-4" /> {s.status === "locating" ? "Locating…" : "Nearest to me"}
          </button>
          {(s.origin || s.query) && (
            <button type="button" onClick={s.reset} className="text-[14px] font-semibold text-muted underline-offset-4 hover:underline">
              Clear
            </button>
          )}
          <p className="ml-auto text-[14px] text-muted" aria-live="polite">
            {s.results.length} {s.results.length === 1 ? "branch" : "branches"}
            {s.origin ? ` near ${s.origin.label}` : ""}
          </p>
        </div>
        {s.message && <p className="mt-3 text-[14px] text-accent-ink">{s.message}</p>}

        <ul className="mt-5 divide-y divide-line overflow-y-auto rounded-3xl border border-line bg-surface lg:max-h-[640px]" data-lenis-prevent>
          {s.results.map(({ branch: b, km }) => (
            <li key={b.slug}>
              <button
                type="button"
                onClick={() => setSelected(b.slug)}
                aria-pressed={selected === b.slug}
                className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${selected === b.slug ? "bg-surface-alt" : "hover:bg-surface-alt/60"}`}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                  {b.leaders[0]?.photo && <Image src={b.leaders[0].photo} alt="" fill sizes="48px" className="object-cover object-top" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{b.shortName}</span>
                  <span className="block text-[13px] text-muted">
                    {b.city}, {b.region}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-ink/75">
                    <NextLabel slug={b.slug} />
                  </span>
                </span>
                {km != null && <span className="shrink-0 text-[13px] font-semibold text-ink/70">{formatDistance(km)}</span>}
              </button>
            </li>
          ))}
          {!s.results.length && (
            <li className="p-6 text-[15px] text-muted">No branch matches “{s.query}”. Press Search to sort every branch by distance from there.</li>
          )}
        </ul>
      </div>

      <div className="relative min-h-[420px] overflow-hidden rounded-3xl lg:min-h-[720px]">
        <MapView points={points} selected={selected} onSelect={setSelected} origin={s.origin} className="absolute inset-0" />
        {sel && (
          <aside aria-label={`${sel.shortName} details`} className="absolute inset-x-3 bottom-3 max-h-[75%] overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_60px_-20px_rgba(23,20,18,0.45)] md:inset-x-auto md:right-4 md:top-4 md:bottom-auto md:w-[380px]">
            <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line-strong hover:border-ink">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent-ink">{sel.isHQ ? "Headquarters" : "Branch"}</p>
            <p className="display mt-1 text-[30px] leading-none">{sel.shortName}</p>
            <p className="mt-2 text-[15px] text-muted">{sel.address}</p>
            <ul className="mt-4 space-y-1.5 text-[14px]">
              {sel.meetings
                .filter((m) => isActive(m))
                .slice(0, 4)
                .map((m) => (
                  <li key={m.title} className="flex justify-between gap-4 border-b border-line pb-1.5">
                    <span>
                      <span className="font-semibold">{m.title}</span>
                      <span className="block text-[12px] text-muted">{recurrenceLabel(m)}</span>
                    </span>
                    <span className="shrink-0 text-right text-ink/80">
                      {meetingTime(m)} {m.start ? tzAbbr(m.timezone) : ""}
                    </span>
                  </li>
                ))}
              {!sel.meetings.length && <li className="text-muted">Meeting times coming soon.</li>}
            </ul>
            {sel.leaders[0] && (
              <p className="mt-4 text-[14px] text-muted">
                {sel.leaders[0].title}: <span className="font-semibold text-ink">{sel.leaders[0].name}</span>
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/branches/${sel.slug}`} className="btn-accent inline-flex h-11 items-center rounded-full px-5 text-[14px] font-semibold">
                View branch
              </Link>
              <Link href={`/branches/${sel.slug}/visit`} className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-[14px] font-semibold hover:border-ink">
                Plan a visit
              </Link>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(sel.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center px-2 text-[14px] font-semibold text-accent-ink">
                Directions ↗
              </a>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
