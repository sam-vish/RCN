"use client";

import { useEffect, useState } from "react";
import { useLiveBranch } from "@/lib/useSchedules";
import type { Meeting } from "@/content/types";
import {
  formatInZone,
  mainMeeting,
  meetingTime,
  nextGathering,
  occurrences,
  recurrenceLabel,
  tzAbbr,
  type Occurrence,
} from "@/lib/schedule";

/** `null` during SSR/first paint (avoids hydration mismatches), then ticks. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0);
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [intervalMs]);
  return now;
}

export function relative(start: Date, now: Date) {
  const mins = Math.round((start.getTime() - now.getTime()) / 60000);
  if (mins <= 0) return "happening now";
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs} hr${hrs > 1 ? "s" : ""}${mins % 60 && hrs < 6 ? ` ${mins % 60} min` : ""}`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

function staticLabel(m: Meeting | null) {
  if (!m) return "Meeting times coming soon";
  const time = meetingTime(m);
  return `${recurrenceLabel(m)}${time ? ` · ${time}` : ""}${m.start ? ` ${tzAbbr(m.timezone)}` : ""}`;
}

/** One-line "Next: …" for lists. */
export function NextLabel({ slug }: { slug: string }) {
  const now = useNow(60000);
  const b = useLiveBranch(slug);
  if (!b) return null;
  const occ = now ? nextGathering(b, now) : null;
  if (!occ) {
    const m = mainMeeting(b);
    return <>{m ? `${m.title} · ${staticLabel(m)}` : "Meeting times coming soon"}</>;
  }
  const tz = occ.meeting.timezone;
  return (
    <>
      {occ.live ? (
        <span className="font-semibold text-accent">● Live now: </span>
      ) : null}
      {occ.meeting.title} · {formatInZone(occ.start, tz, { weekday: "short", hour: "numeric", minute: "2-digit" })} {tzAbbr(tz, occ.start)}
      {!occ.live && now ? ` · ${relative(occ.start, now)}` : ""}
    </>
  );
}

function localLine(occ: Occurrence) {
  const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!visitorTz || visitorTz === occ.meeting.timezone) return null;
  const branchClock = formatInZone(occ.start, occ.meeting.timezone, { hour: "numeric", minute: "2-digit" });
  const yours = formatInZone(occ.start, visitorTz, { weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  return yours.endsWith(branchClock) ? null : `That's ${yours} where you are`;
}

/** Hero card: "Next gathering · Sunday 11:00 AM EST · in 2 days". */
export function NextGatheringCard({ slug, tone = "night" }: { slug: string; tone?: "night" | "light" }) {
  const now = useNow(30000);
  const b = useLiveBranch(slug);
  if (!b) return null;
  const occ = now ? nextGathering(b, now) : null;
  const fallback = mainMeeting(b);
  const muted = tone === "night" ? "text-on-night-muted" : "text-muted";
  return (
    <div
      className={`inline-flex max-w-full flex-col gap-1 rounded-2xl border px-5 py-4 backdrop-blur-md ${
        tone === "night" ? "border-on-night/20 bg-night/45" : "border-line bg-surface"
      }`}
    >
      <p className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] ${tone === "night" ? "text-gold" : "text-accent-ink"}`}>
        <span className={`h-2 w-2 rounded-full bg-accent ${occ?.live ? "live-dot" : ""}`} aria-hidden />
        {occ?.live ? "Happening now" : "Next gathering"}
      </p>
      {occ ? (
        <>
          <p className="text-[17px] font-semibold md:text-lg">
            {occ.meeting.title} · {formatInZone(occ.start, occ.meeting.timezone, { weekday: "long", month: "short", day: "numeric" })},{" "}
            {formatInZone(occ.start, occ.meeting.timezone, { hour: "numeric", minute: "2-digit" })} {tzAbbr(occ.meeting.timezone, occ.start)}
            {!occ.live && now && <span className={muted}> · {relative(occ.start, now)}</span>}
          </p>
          {localLine(occ) && <p className={`text-[13px] ${muted}`}>{localLine(occ)}</p>}
        </>
      ) : (
        <p className="text-[17px] font-semibold md:text-lg">{fallback ? `${fallback.title} · ${staticLabel(fallback)}` : "Meeting times coming soon"}</p>
      )}
    </div>
  );
}

/** Big flip-style countdown to a specific meeting (Orlando's 7 Hour gathering). */
export function Countdown({ slug, title, tone = "night" }: { slug: string; title: string; tone?: "night" | "light" }) {
  const now = useNow(1000);
  const b = useLiveBranch(slug);
  const m = b?.meetings.find((x) => x.title === title);
  const next = m && now ? occurrences(m, now, 3) : [];
  const occ = next[0];
  const units = occ && now && !occ.live ? split(occ.start.getTime() - now.getTime()) : null;
  const box = tone === "night" ? "border-on-night/15 bg-on-night/[0.06]" : "border-line bg-surface";
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off" aria-label={occ && now ? `Starts ${relative(occ.start, now)}` : "Countdown"}>
        {(["days", "hours", "min", "sec"] as const).map((u, i) => (
          <div key={u} className={`rounded-2xl border px-2 py-4 text-center sm:py-5 ${box}`}>
            <span className="display block text-[clamp(31px,5.5vw,59px)] tabular-nums">
              {occ?.live ? (i === 0 ? "●" : "") : units ? String(units[i]).padStart(2, "0") : "––"}
            </span>
            <span className={`mt-1 block text-[11px] font-bold uppercase tracking-[0.2em] ${tone === "night" ? "text-on-night-muted" : "text-muted"}`}>
              {occ?.live && i === 0 ? "Live" : u}
            </span>
          </div>
        ))}
      </div>
      {occ && m && (
        <p className={`mt-4 text-[15px] ${tone === "night" ? "text-on-night/85" : "text-muted"}`}>
          {occ.live ? "Happening now" : "Next"}: <strong className="font-semibold">{formatInZone(occ.start, m.timezone, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong>,{" "}
          {meetingTime(m)} {tzAbbr(m.timezone, occ.start)}
          {next[1] && (
            <span className="block text-[13px] opacity-80">
              Then {next.slice(1).map((o) => formatInZone(o.start, m.timezone, { month: "short", day: "numeric" })).join(" and ")}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}
