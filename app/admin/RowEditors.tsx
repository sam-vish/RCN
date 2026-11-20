"use client";

import { useState } from "react";
import type { Leader, Meeting, Weekday } from "@/content/types";

const DAYS: (Weekday | "Daily")[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Daily"];
const TZS = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto"];
const RULES = [
  { v: "weekly", label: "Every week" },
  { v: "1", label: "First of the month" },
  { v: "2", label: "Second of the month" },
  { v: "3", label: "Third of the month" },
  { v: "4", label: "Fourth of the month" },
  { v: "-1", label: "Last of the month" },
  { v: "1,3,5", label: "1st, 3rd & 5th" },
  { v: "biweekly", label: "Every other week" },
  { v: "unscheduled", label: "Dates vary" },
];

const cell = "w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-[14px] focus:border-accent-deep focus:outline-none";

function ruleOf(m: Meeting) {
  const r = m.recurrence;
  if (r.kind === "nth") return r.n.join(",");
  return r.kind === "daily" ? "weekly" : r.kind;
}
function toRule(v: string, day: string): Meeting["recurrence"] {
  if (day === "Daily") return { kind: "daily" };
  if (v === "weekly" || v === "biweekly" || v === "unscheduled") return { kind: v };
  return { kind: "nth", n: v.split(",").map(Number) };
}

/** Meeting times as editable rows; serialised into a hidden `meetings_json` field. */
export function MeetingsEditor({ initial }: { initial: Meeting[] }) {
  const [rows, setRows] = useState<Meeting[]>(initial);
  const set = (i: number, patch: Partial<Meeting>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  return (
    <fieldset>
      <legend className="mb-1 text-[14px] font-semibold">Meeting times</legend>
      <p className="mb-3 text-[13px] text-muted">Times are local to the branch. Countdowns, calendar files and the plan-a-visit dates all follow these.</p>
      <input type="hidden" name="meetings_json" value={JSON.stringify(rows)} />
      <div className="space-y-3">
        {rows.map((m, i) => (
          <div key={i} className="grid gap-2 rounded-2xl border border-line bg-surface-alt/60 p-3 md:grid-cols-[1.3fr_1fr_0.8fr_0.8fr_1.2fr_auto]">
            <input aria-label="Title" className={cell} value={m.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="Sunday Worship Service" />
            <select aria-label="Day" className={cell} value={m.day} onChange={(e) => set(i, { day: e.target.value as Meeting["day"], recurrence: toRule(ruleOf(m), e.target.value) })}>
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <input aria-label="Start" type="time" className={cell} value={m.start ?? ""} onChange={(e) => set(i, { start: e.target.value || undefined })} />
            <input aria-label="End" type="time" className={cell} value={m.end ?? ""} onChange={(e) => set(i, { end: e.target.value || undefined })} />
            <select aria-label="Repeats" className={cell} value={ruleOf(m)} onChange={(e) => set(i, { recurrence: toRule(e.target.value, m.day) })} disabled={m.day === "Daily"}>
              {RULES.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setRows((r) => r.filter((_, k) => k !== i))} className="rounded-lg px-3 text-[13px] font-semibold text-[#b42318] hover:bg-[#b42318]/10" aria-label={`Remove ${m.title || "meeting"}`}>
              Remove
            </button>
            <input aria-label="Note" className={`${cell} md:col-span-2`} value={m.note ?? ""} onChange={(e) => set(i, { note: e.target.value || undefined })} placeholder="Note, e.g. House church; contact us for the address" />
            <select aria-label="Time zone" className={cell} value={m.timezone} onChange={(e) => set(i, { timezone: e.target.value })}>
              {[...new Set([m.timezone, ...TZS])].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              aria-label="Online link"
              className={`${cell} md:col-span-2`}
              value={m.online?.url ?? ""}
              onChange={(e) => set(i, { online: e.target.value ? { ...m.online, url: e.target.value } : m.online && !m.online.meetingId ? undefined : m.online })}
              placeholder="Online join link (Zoom etc.), if any"
            />
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={Boolean(m.signature)} onChange={(e) => set(i, { signature: e.target.checked || undefined })} className="accent-[#c4501a]" /> Signature
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { title: "", day: "Sunday", start: "10:00", timezone: r[0]?.timezone ?? "America/New_York", recurrence: { kind: "weekly" } }])}
        className="mt-3 rounded-full border border-line-strong px-4 py-2 text-[14px] font-semibold hover:border-ink"
      >
        + Add a meeting time
      </button>
    </fieldset>
  );
}

/** Leadership rows; serialised into `leaders_json`. First row = Pointman (shown large). */
export function LeadersEditor({ initial }: { initial: Leader[] }) {
  const [rows, setRows] = useState<Leader[]>(initial);
  const set = (i: number, patch: Partial<Leader>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const c = [...r];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  return (
    <fieldset>
      <legend className="mb-1 text-[14px] font-semibold">Leadership</legend>
      <p className="mb-3 text-[13px] text-muted">The first person is shown large as the Pointman. Photo: paste a public image URL (e.g. from Supabase Storage).</p>
      <input type="hidden" name="leaders_json" value={JSON.stringify(rows)} />
      <div className="space-y-2">
        {rows.map((l, i) => (
          <div key={i} className="grid gap-2 rounded-2xl border border-line bg-surface-alt/60 p-3 md:grid-cols-[1fr_1fr_1.4fr_auto]">
            <input aria-label="Name" className={cell} value={l.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Name" />
            <input aria-label="Title" className={cell} value={l.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="e.g. Boston Pointman" />
            <input aria-label="Photo URL" className={cell} value={l.photo ?? ""} onChange={(e) => set(i, { photo: e.target.value || undefined })} placeholder="Photo URL" />
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="rounded-lg px-2 text-[13px] hover:bg-ink/5" aria-label="Move up">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} className="rounded-lg px-2 text-[13px] hover:bg-ink/5" aria-label="Move down">
                ↓
              </button>
              <button type="button" onClick={() => setRows((r) => r.filter((_, k) => k !== i))} className="rounded-lg px-2 text-[13px] font-semibold text-[#b42318] hover:bg-[#b42318]/10" aria-label={`Remove ${l.name}`}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows((r) => [...r, { name: "", title: "" }])} className="mt-3 rounded-full border border-line-strong px-4 py-2 text-[14px] font-semibold hover:border-ink">
        + Add a leader
      </button>
    </fieldset>
  );
}
