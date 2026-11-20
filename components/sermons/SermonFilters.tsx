"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui";

type Opt = { value: string; label: string; count?: number };

/** Live search + filters, kept in the URL so results are shareable and server-rendered. */
export function SermonFilters({
  speakers,
  series,
  branches,
  years,
  total,
}: {
  speakers: Opt[];
  series: Opt[];
  branches: Opt[];
  years: Opt[];
  total: number;
}) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const push = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    start(() => router.replace(`${path}${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => {
    clearTimeout(timer.current);
    if (q === (params.get("q") ?? "")) return;
    timer.current = setTimeout(() => push({ q: q.trim() || null }), 280);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = ["speaker", "series", "branch", "year", "q"].filter((k) => params.get(k));
  const select = (name: string, label: string, opts: Opt[]) => (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={params.get(name) ?? ""}
        onChange={(e) => push({ [name]: e.target.value || null })}
        className={`h-12 w-full appearance-none rounded-full border bg-surface pl-4 pr-9 text-[14px] font-semibold outline-none focus:border-accent-deep ${params.get(name) ? "border-ink" : "border-line-strong"}`}
      >
        <option value="">{label}</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
            {o.count != null ? ` (${o.count})` : ""}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden>
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </label>
  );

  return (
    <div className="rounded-3xl border border-line bg-surface-alt p-3 md:p-4">
      <div className="grid gap-3 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="flex h-12 items-center gap-2 rounded-full border border-line-strong bg-surface pl-4 pr-2 focus-within:border-accent-deep">
          <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
          <label htmlFor="sermon-q" className="sr-only">
            Search messages
          </label>
          <input
            id="sermon-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, topics, speakers…"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted/80"
          />
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />}
        </div>
        {select("speaker", "All speakers", speakers)}
        {select("series", "All series", series)}
        {select("branch", "All branches", branches)}
        {select("year", "Any year", years)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 px-2 text-[14px]">
        <p aria-live="polite" className="font-semibold">
          {total.toLocaleString()} {total === 1 ? "message" : "messages"}
        </p>
        {active.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              start(() => router.replace(path, { scroll: false }));
            }}
            className="font-semibold text-accent-ink underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
