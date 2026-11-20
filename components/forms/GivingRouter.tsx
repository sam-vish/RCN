"use client";

import { useState } from "react";
import { branches } from "@/content/branches";
import { Icon, Pending } from "@/components/ui";

/**
 * Designation → that designation's own giving page. Each branch has its own processor
 * (confirmed by the ministry), so this page only routes; it never handles payments or shows
 * account numbers. Links live in the branch data (Supabase `branches.giving_url` later).
 */
export function GivingRouter({ initial }: { initial?: string }) {
  const valid = initial && branches.some((b) => b.slug === initial) ? initial : "national";
  const [sel, setSel] = useState(valid);
  const b = branches.find((x) => x.slug === sel);
  const url = sel === "national" ? undefined : b?.ext.givingUrl;
  const name = sel === "national" ? "RCN North America" : b?.shortName;

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 md:p-10">
      <label htmlFor="designation" className="text-[13px] font-bold uppercase tracking-[0.18em] text-muted">
        I&apos;d like to give to
      </label>
      <div className="relative mt-3">
        <select
          id="designation"
          value={sel}
          onChange={(e) => {
            setSel(e.target.value);
            const u = new URL(window.location.href);
            if (e.target.value === "national") u.searchParams.delete("branch");
            else u.searchParams.set("branch", e.target.value);
            window.history.replaceState(null, "", u);
          }}
          className="h-14 w-full appearance-none rounded-2xl border border-line-strong bg-bg px-5 pr-12 text-[18px] font-semibold outline-none focus:border-accent-deep"
        >
          <option value="national">RCN North America (national)</option>
          <optgroup label="A branch">
            {branches.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.shortName} · {x.city}, {x.region}
              </option>
            ))}
          </optgroup>
        </select>
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="mt-8 rounded-2xl bg-surface-alt p-6" aria-live="polite">
        <p className="display text-[28px] leading-tight">{name}</p>
        {url ? (
          <>
            <p className="mt-2 text-muted">You&apos;ll continue to {name}&apos;s secure giving page.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-accent mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold sm:w-auto sm:px-10">
              <Icon name="heart" className="h-5 w-5" /> Give to {name} ↗
            </a>
            {b?.ext.givingConfirm && <Pending className="mt-4">{b.ext.givingConfirm}</Pending>}
          </>
        ) : (
          <>
            <p className="mt-2 text-muted">Online giving for {name} is being set up. Each branch has its own giving page; this button will take you straight there.</p>
            <span className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-line-strong text-[15px] font-semibold text-muted sm:w-auto sm:px-10">
              <Icon name="lock" className="h-4 w-4" /> Giving link coming soon
            </span>
            <Pending className="mt-4">Giving link / processor for {name}.</Pending>
          </>
        )}
      </div>
    </div>
  );
}
