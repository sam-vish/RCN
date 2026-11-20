import "server-only";
import { sbSelect, supabaseEnabled } from "./supabase";
import { sampleEvents, type RcnEvent } from "@/content/events";

type EventRow = {
  slug: string;
  scope: RcnEvent["scope"];
  title: string;
  start_at: string | null;
  end_at: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  description: string | null;
  registration_enabled: boolean | null;
  capacity: number | null;
  branch_slug: string | null;
};

/** Published, upcoming events from Supabase, plus the one labelled sample. Never invented. */
export async function getEvents(): Promise<RcnEvent[]> {
  let live: RcnEvent[] = [];
  if (supabaseEnabled) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const rows = await sbSelect<EventRow>(
        "events_public",
        `select=*&or=(end_at.gte.${today},and(end_at.is.null,start_at.gte.${today}))&order=start_at.asc&limit=60`,
      );
      live = rows.map((r) => ({
        slug: r.slug,
        scope: r.scope,
        title: r.title,
        startDate: r.start_at?.slice(0, 10),
        endDate: r.end_at?.slice(0, 10),
        venue: r.venue ?? undefined,
        address: r.address ?? undefined,
        city: r.city ?? undefined,
        summary: r.description ?? "",
        registration: Boolean(r.registration_enabled),
        capacity: r.capacity ?? undefined,
        branch: r.branch_slug ?? undefined,
      }));
    } catch (e) {
      console.error(e);
    }
  }
  return [...live, ...sampleEvents.filter((s) => !live.some((l) => l.slug === s.slug))];
}

export async function getEvent(slug: string) {
  return (await getEvents()).find((e) => e.slug === slug);
}
