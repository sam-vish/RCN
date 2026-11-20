"use server";

import { revalidatePath } from "next/cache";
import { asUser, getSession } from "@/lib/auth";
import type { Leader, Meeting } from "@/content/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Daily"];
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validate what the browser sent; never trust its shape. */
function cleanMeetings(raw: unknown): Meeting[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 20).flatMap((m): Meeting[] => {
    const title = str(m?.title, 80);
    const day = DAYS.includes(m?.day) ? m.day : null;
    if (!title || !day) return [];
    const r = m?.recurrence;
    const recurrence: Meeting["recurrence"] =
      day === "Daily" ? { kind: "daily" }
      : r?.kind === "nth" && Array.isArray(r.n) ? { kind: "nth", n: r.n.map(Number).filter((n: number) => [-1, 1, 2, 3, 4, 5].includes(n)) }
      : ["weekly", "biweekly", "unscheduled"].includes(r?.kind) ? { kind: r.kind }
      : { kind: "weekly" };
    let tz = "America/New_York";
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: str(m?.timezone, 60) });
      tz = str(m?.timezone, 60) || tz;
    } catch {}
    const url = str(m?.online?.url, 300);
    return [{
      title,
      day,
      timezone: tz,
      recurrence,
      ...(HM.test(m?.start) ? { start: m.start } : { timeText: str(m?.timeText, 60) || "Time to be announced" }),
      ...(HM.test(m?.end) ? { end: m.end } : {}),
      ...(str(m?.note, 200) ? { note: str(m.note, 200) } : {}),
      ...(url.startsWith("https://") ? { online: { url } } : m?.online ? { online: {} } : {}),
      ...(m?.signature ? { signature: true } : {}),
    }];
  });
}

function cleanLeaders(raw: unknown): Leader[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 20).flatMap((l): Leader[] => {
    const name = str(l?.name, 80);
    if (!name) return [];
    const photo = str(l?.photo, 400);
    return [{ name, title: str(l?.title, 80), ...(photo.startsWith("https://") || photo.startsWith("/images/") ? { photo } : {}) }];
  });
}

export type SaveState = { ok?: boolean; error?: string };

const url = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
};

export async function saveBranch(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const s = await getSession();
  if (!s?.token || !s.profile) return { error: "Your session has expired. Sign in again." };
  const slug = String(fd.get("slug"));
  if (s.profile.role !== "network_admin" && s.profile.branch_slug !== slug) return { error: "You can only edit your own branch." };

  const lines = (k: string) =>
    String(fd.get(k) ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12);
  let meetings: Meeting[] | null = null;
  let leaders: Leader[] | null = null;
  try {
    meetings = cleanMeetings(JSON.parse(String(fd.get("meetings_json") ?? "[]")));
    leaders = cleanLeaders(JSON.parse(String(fd.get("leaders_json") ?? "[]")));
  } catch {
    return { error: "Couldn't read the meeting times or leaders. Reload and try again." };
  }
  const row = {
    slug,
    meetings: meetings.length ? meetings : null,
    leaders: leaders.length ? leaders : null,
    what_to_expect: lines("what_to_expect").map((l) => {
      const [title, ...rest] = l.split(":");
      return { title: title.trim().slice(0, 80), body: rest.join(":").trim().slice(0, 600) };
    }),
    parking_notes: lines("parking_notes").map((l) => l.slice(0, 300)),
    giving_url: url(fd.get("giving_url")),
    whatsapp_url: url(fd.get("whatsapp_url")),
    telegram_url: url(fd.get("telegram_url")),
    chmeetings_url: url(fd.get("chmeetings_url")),
    hero_image_url: url(fd.get("hero_image_url")),
    updated_at: new Date().toISOString(),
  };
  // RLS (supabase/schema.sql) re-checks the role server-side; this is an upsert on slug.
  const res = await asUser(s.token, "branch_content?on_conflict=slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
  if (!res.ok) return { error: `Couldn't save (${res.status}). Check your role in the profiles table.` };
  revalidatePath(`/branches/${slug}`);
  revalidatePath("/api/schedule");
  return { ok: true };
}
