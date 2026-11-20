// Timezone-correct "next gathering" maths with no date library.
// Meetings are stored as wall-clock times in the branch's IANA timezone; we find the next
// matching day in that zone and convert to a real instant, so DST and visitors in other
// timezones are handled (PRD §11: "countdown correct across timezones").

import type { Branch, Meeting, Weekday } from "@/content/types";

export const WEEKDAYS: Weekday[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Parts = { y: number; m: number; d: number; h: number; min: number; wd: number };

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string) {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      weekday: "short",
    });
    dtfCache.set(tz, f);
  }
  return f;
}

const WD_SHORT: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function zonedParts(date: Date, tz: string): Parts {
  const p: Record<string, string> = {};
  for (const x of dtf(tz).formatToParts(date)) p[x.type] = x.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute, wd: WD_SHORT[p.weekday] };
}

function offsetMs(date: Date, tz: string) {
  const p = zonedParts(date, tz);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, date.getUTCSeconds());
  return asUtc - (date.getTime() - date.getUTCMilliseconds());
}

/** Wall-clock time in `tz` → the real instant. */
export function zonedToDate(y: number, m: number, d: number, h: number, min: number, tz: string) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  let t = guess - offsetMs(new Date(guess), tz);
  t = guess - offsetMs(new Date(t), tz); // second pass settles DST edges
  return new Date(t);
}

function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Does calendar day (y, m, d) match the meeting's recurrence? */
function dayMatches(meeting: Meeting, y: number, m: number, d: number, wd: number) {
  const r = meeting.recurrence;
  if (r.kind === "daily" || meeting.day === "Daily") return true;
  if (WEEKDAYS[wd] !== meeting.day) return false;
  if (r.kind === "weekly") return true;
  if (r.kind === "nth") {
    const nth = Math.ceil(d / 7);
    const isLast = d + 7 > daysInMonth(y, m);
    return r.n.some((n) => (n === -1 ? isLast : n === nth));
  }
  return false;
}

function hm(s?: string) {
  if (!s) return null;
  const [h, min] = s.split(":").map(Number);
  return { h, min };
}

export function isActive(meeting: Meeting, now = new Date()) {
  return !meeting.activeUntil || new Date(`${meeting.activeUntil}T23:59:59`) >= now;
}

/** Can we compute a countdown for this meeting at all? */
export function isSchedulable(meeting: Meeting) {
  return Boolean(meeting.start) && ["weekly", "daily", "nth"].includes(meeting.recurrence.kind);
}

export type Occurrence = { meeting: Meeting; start: Date; end: Date; live: boolean };

/** Next occurrences (or the one in progress) within ~20 weeks. */
export function occurrences(meeting: Meeting, now = new Date(), count = 1): Occurrence[] {
  if (!isSchedulable(meeting) || !isActive(meeting, now)) return [];
  const s = hm(meeting.start)!;
  const e = hm(meeting.end);
  const tz = meeting.timezone;
  const out: Occurrence[] = [];
  const today = zonedParts(now, tz);
  // Start a day early so an overnight meeting that began yesterday can still be "live".
  const base = Date.UTC(today.y, today.m - 1, today.d) - 86400000;
  for (let i = 0; i < 140 && out.length < count; i++) {
    const day = new Date(base + i * 86400000);
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    if (!dayMatches(meeting, y, m, d, day.getUTCDay())) continue;
    const start = zonedToDate(y, m, d, s.h, s.min, tz);
    let end: Date;
    if (e) {
      end = zonedToDate(y, m, d, e.h, e.min, tz);
      if (end <= start) end = new Date(end.getTime() + 86400000); // crosses midnight
    } else {
      end = new Date(start.getTime() + 2 * 3600000); // assume ~2h when no end time is published
    }
    if (end <= now) continue;
    out.push({ meeting, start, end, live: start <= now });
  }
  return out;
}

export function nextGathering(branch: Pick<Branch, "meetings">, now = new Date()) {
  // In-person, non-daily gatherings headline; an online or nightly prayer line shouldn't.
  const all = branch.meetings
    .filter((m) => m.signature || (!m.online && m.day !== "Daily" && m.recurrence.kind !== "daily"))
    .flatMap((m) => occurrences(m, now, 1));
  const pool = all.length ? all : branch.meetings.flatMap((m) => occurrences(m, now, 1));
  return pool.sort((a, b) => a.start.getTime() - b.start.getTime())[0] ?? null;
}

/** The meeting to headline when there's no countdown (e.g. unscheduled dates). */
export function mainMeeting(branch: Pick<Branch, "meetings">) {
  const active = branch.meetings.filter((m) => isActive(m));
  return active.find((m) => m.day === "Sunday") ?? active.find((m) => m.signature) ?? active[0] ?? null;
}

// ---------- formatting ----------

export function formatClock(hhmm?: string) {
  const t = hm(hhmm);
  if (!t) return "";
  const h12 = t.h % 12 || 12;
  return `${h12}:${String(t.min).padStart(2, "0")} ${t.h < 12 ? "AM" : "PM"}`;
}

export function tzAbbr(tz: string, at = new Date()) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(at);
  return p.find((x) => x.type === "timeZoneName")?.value ?? "";
}

export function meetingTime(m: Meeting) {
  if (!m.start) return m.timeText ?? "";
  return m.end ? `${formatClock(m.start)} – ${formatClock(m.end)}` : formatClock(m.start);
}

const ORD = ["", "First", "Second", "Third", "Fourth", "Fifth"];
export function recurrenceLabel(m: Meeting) {
  const r = m.recurrence;
  if (r.kind === "daily" || m.day === "Daily") return "Daily";
  if (r.kind === "weekly") return `Every ${m.day}`;
  if (r.kind === "biweekly") return `Every other ${m.day}`;
  if (r.kind === "nth") {
    const words = r.n.map((n) => (n === -1 ? "Last" : ORD[n]));
    const joined =
      words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)!.toLowerCase()}` : words[0];
    return `${joined} ${m.day} of the month`;
  }
  return `${m.day}s · dates vary`;
}

export function formatInZone(date: Date, tz: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(date);
}

/** ICS (RFC 5545) for one meeting, recurring where the rule allows. */
export function meetingIcs(
  m: Meeting,
  branch: Pick<Branch, "shortName" | "address" | "slug">,
  siteUrl: string,
  first?: Date,
) {
  const occ = first ? { start: first } : occurrences(m, new Date(), 1)[0];
  if (!occ) return null;
  const s = hm(m.start)!;
  const e = hm(m.end) ?? { h: (s.h + 2) % 24, min: s.min };
  const p = zonedParts(occ.start, m.timezone);
  const pad = (n: number) => String(n).padStart(2, "0");
  const local = (y: number, mo: number, d: number, h: number, mi: number) => `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(mi)}00`;
  let endDay = new Date(Date.UTC(p.y, p.m - 1, p.d));
  if (e.h * 60 + e.min <= s.h * 60 + s.min) endDay = new Date(endDay.getTime() + 86400000);
  const byday = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][p.wd];
  let rrule = "";
  if (m.recurrence.kind === "weekly") rrule = `RRULE:FREQ=WEEKLY;BYDAY=${byday}`;
  if (m.recurrence.kind === "daily") rrule = "RRULE:FREQ=DAILY";
  if (m.recurrence.kind === "nth") rrule = `RRULE:FREQ=MONTHLY;BYDAY=${m.recurrence.n.map((n) => `${n}${byday}`).join(",")}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RCN North America//Gatherings//EN",
    "BEGIN:VEVENT",
    `UID:${branch.slug}-${m.title.replace(/\W+/g, "-").toLowerCase()}@rcnnorthamerica.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=${m.timezone}:${local(p.y, p.m, p.d, s.h, s.min)}`,
    `DTEND;TZID=${m.timezone}:${local(endDay.getUTCFullYear(), endDay.getUTCMonth() + 1, endDay.getUTCDate(), e.h, e.min)}`,
    rrule,
    `SUMMARY:${m.title} · ${branch.shortName}`,
    `LOCATION:${m.online ? "Online" : branch.address.replace(/,/g, "\\,")}`,
    `URL:${siteUrl}/branches/${branch.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}
