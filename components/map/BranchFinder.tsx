"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { formatDistance, useBranchSearch } from "./useBranchSearch";
import { NextLabel } from "@/components/branch/NextGathering";

/** Search box + ranked branch list. Used in the global dialog and on the home hero. */
export function BranchFinder({ compact = false, autoFocus = false, tone = "light" }: { compact?: boolean; autoFocus?: boolean; tone?: "light" | "night" }) {
  const s = useBranchSearch();
  const [typed, setTouched] = useState(false);
  const touched = typed || Boolean(s.origin);
  const shown = compact || touched ? s.results.slice(0, compact ? 6 : 4) : [];
  const night = tone === "night";

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          s.search(s.query);
        }}
        className={`flex items-center gap-2 rounded-full border p-1.5 pl-5 ${
          night ? "border-on-night/25 bg-night/55 backdrop-blur-md" : "border-line-strong bg-surface"
        }`}
      >
        <Icon name="search" className={`h-5 w-5 shrink-0 ${night ? "text-on-night/70" : "text-muted"}`} />
        <label htmlFor={compact ? "finder-q-dialog" : "finder-q"} className="sr-only">
          Enter your city or ZIP
        </label>
        <input
          id={compact ? "finder-q-dialog" : "finder-q"}
          value={s.query}
          autoFocus={autoFocus}
          onChange={(e) => {
            s.setQuery(e.target.value);
            setTouched(true);
          }}
          placeholder="Enter your city or ZIP"
          autoComplete="postal-code"
          className={`min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none ${night ? "text-on-night placeholder:text-on-night/60" : "placeholder:text-muted/80"}`}
        />
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            s.locate();
          }}
          className={`hidden h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold sm:inline-flex ${
            night ? "text-on-night hover:bg-on-night/10" : "text-ink hover:bg-ink/5"
          }`}
        >
          <Icon name="locate" className="h-4 w-4" />
          {s.status === "locating" ? "Locating…" : "Near me"}
        </button>
        <button type="submit" className="btn-accent inline-flex h-10 shrink-0 items-center rounded-full px-5 text-[14px] font-semibold">
          {s.status === "searching" ? "Searching…" : "Search"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setTouched(true);
          s.locate();
        }}
        className={`mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold sm:hidden ${night ? "text-on-night" : "text-accent-ink"}`}
      >
        <Icon name="locate" className="h-4 w-4" /> {s.status === "locating" ? "Locating…" : "Use my location"}
      </button>

      <div aria-live="polite" className="sr-only">
        {touched ? `${s.results.length} branches${s.origin ? ` sorted by distance from ${s.origin.label}` : ""}` : ""}
      </div>
      {s.message && <p className={`mt-3 text-[14px] ${night ? "text-[#ffc7b0]" : "text-accent-ink"}`}>{s.message}</p>}

      {shown.length > 0 && (
        <ul className={`mt-3 overflow-hidden rounded-2xl border ${night ? "border-on-night/15 bg-night/80 backdrop-blur-md" : "border-line bg-surface"}`}>
          {s.origin && (
            <li className={`px-5 pt-3 text-[12px] font-bold uppercase tracking-[0.16em] ${night ? "text-gold" : "text-accent-ink"}`}>
              Nearest to {s.origin.label}
            </li>
          )}
          {shown.map(({ branch: b, km }) => (
            <li key={b.slug} className={night ? "border-t border-on-night/10 first:border-0" : "border-t border-line first:border-0"}>
              <Link href={`/branches/${b.slug}`} className={`group flex items-center gap-4 px-5 py-3.5 ${night ? "hover:bg-on-night/5" : "hover:bg-surface-alt"}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <Icon name="pin" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {b.shortName}
                    <span className={`font-medium ${night ? "text-on-night-muted" : "text-muted"}`}> · {b.city}, {b.region}</span>
                  </span>
                  <span className={`block truncate text-[13px] ${night ? "text-on-night-muted" : "text-muted"}`}>
                    <NextLabel slug={b.slug} />
                  </span>
                </span>
                {km != null && <span className={`shrink-0 text-[13px] font-semibold ${night ? "text-on-night/80" : "text-ink/70"}`}>{formatDistance(km)}</span>}
              </Link>
            </li>
          ))}
          {!compact && (
            <li className={night ? "border-t border-on-night/10" : "border-t border-line"}>
              <Link href="/locations" className={`block px-5 py-3 text-[14px] font-semibold ${night ? "text-gold" : "text-accent-ink"}`}>
                See all {s.results.length} on the map →
              </Link>
            </li>
          )}
        </ul>
      )}
      {touched && !shown.length && !s.message && s.status === "idle" && s.query && (
        <p className={`mt-3 text-[14px] ${night ? "text-on-night-muted" : "text-muted"}`}>
          No branch name matches. Press Search to find the nearest one to “{s.query}”.
        </p>
      )}
    </div>
  );
}
