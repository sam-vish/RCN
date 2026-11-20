import "server-only";
import snapshot from "@/content/sermons.snapshot.json";
import { site } from "@/content/site";
import { branches } from "@/content/branches";
import { channelFeed } from "./youtube";

export type Sermon = {
  id: string;
  title: string;
  speaker: string;
  date: string; // YYYY-MM-DD
  duration?: number; // seconds
  branch?: string; // branch slug
  series?: string;
};

type Row = [string, string, string, string | null, number | null, string | null, string | null];

// One person, several spellings in video titles.
const SPEAKER_ALIASES: Record<string, string> = {
  "Apostle Dan Ogidi": "Apostle Daniel Ogidi",
  "Rev. Daniel Ogidi": "Apostle Daniel Ogidi",
  "Rev. Philip Gbir": "Reverend Philip Gbir",
};

const base: Sermon[] = (snapshot as Row[]).map(([id, title, speaker, date, duration, branch, series]) => ({
  id,
  title: tidyTitle(title),
  speaker: SPEAKER_ALIASES[speaker] ?? speaker,
  date: date ?? "",
  duration: duration ?? undefined,
  branch: branch ?? undefined,
  series: series ?? undefined,
}));

const CHANNEL_BRANCH: Record<string, string> = Object.fromEntries(
  branches.filter((b) => b.ext.youtubeChannelId).map((b) => [b.ext.youtubeChannelId!, b.slug]),
);

/** Snapshot + anything newer from the RSS feeds of the Apostle's and the branches' channels. */
export async function getLibrary(): Promise<Sermon[]> {
  const known = new Set(base.map((s) => s.id));
  const channels = [site.apostleChannelId, "UCVD3b1UwhKYr3008c64FiAA", "UC5MWMEqJ0e100z9iY2kPO9Q"];
  const feeds = (await Promise.all(channels.map(channelFeed))).flat();
  const fresh: Sermon[] = feeds
    .filter((v) => !known.has(v.id))
    .map((v) => {
      const branch = v.channelId ? CHANNEL_BRANCH[v.channelId] : undefined;
      const upper = v.title.toUpperCase();
      return {
        id: v.id,
        title: tidyTitle(v.title),
        speaker: upper.includes("AROME") || !branch ? "Apostle Arome Osayi" : (branches.find((b) => b.slug === branch)?.shortName ?? "RCN"),
        date: v.published.slice(0, 10),
        branch,
        series: upper.includes("SUNDAY SERVICE") ? "Sunday Service" : undefined,
      };
    });
  const seen = new Set<string>();
  return [...fresh, ...base]
    .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export type SermonFilters = { q?: string; speaker?: string; series?: string; branch?: string; year?: string };

export function filterSermons(all: Sermon[], f: SermonFilters) {
  const words = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  return all.filter(
    (s) =>
      (!f.speaker || s.speaker === f.speaker) &&
      (!f.series || s.series === f.series) &&
      (!f.branch || s.branch === f.branch) &&
      (!f.year || s.date.startsWith(f.year)) &&
      words.every((w) => `${s.title} ${s.speaker} ${s.series ?? ""}`.toLowerCase().includes(w)),
  );
}

export function facets(all: Sermon[]) {
  const count = (key: (s: Sermon) => string | undefined) => {
    const m = new Map<string, number>();
    for (const s of all) {
      const k = key(s);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  return {
    speakers: count((s) => s.speaker),
    series: count((s) => s.series),
    branches: count((s) => s.branch),
    years: count((s) => s.date.slice(0, 4)).sort((a, b) => b[0].localeCompare(a[0])),
  };
}

export async function branchSermons(slug: string, limit = 9) {
  return (await getLibrary()).filter((s) => s.branch === slug).slice(0, limit);
}

/** Titles on these channels are often ALL CAPS with "||" separators; make them readable without changing words. */
export function tidyTitle(title: string) {
  let t = title.replace(/\s*\|\|\s*/g, " — ").replace(/\s+l{1,2}\s+/g, " — ").replace(/\s*\|\s*/g, " — ").replace(/\s{2,}/g, " ").trim();
  const letters = t.replace(/[^A-Za-z]/g, "");
  const upper = letters.replace(/[^A-Z]/g, "").length;
  if (letters.length > 8 && upper / letters.length > 0.7) {
    const keep = new Set(["RCN", "USA", "DMV", "IEC", "CMFI", "NAM", "UK", "II", "III", "TV", "RCNNA", "NIKOS", "FOG", "RCCG", "MA", "NY", "TX", "DR."]);
    const small = new Set(["of", "the", "and", "in", "on", "at", "for", "to", "a", "an", "with", "by"]);
    t = t
      .toLowerCase()
      .split(/(\s+)/)
      .map((w, i) => {
        const up = w.toUpperCase();
        if (keep.has(up)) return up;
        if (i > 0 && small.has(w)) return w;
        return w.replace(/^([("'“]?)(\p{L})/u, (_, p, c) => p + c.toUpperCase());
      })
      .join("");
  }
  return t;
}

export function formatDuration(sec?: number) {
  if (!sec) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
