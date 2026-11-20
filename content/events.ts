// Events. Upcoming events live in Supabase (`events`, edited by leaders in /admin or the Table
// Editor). Per PRD §9 nothing upcoming is seeded, except ONE clearly-labelled sample so the
// ministry can see the event design. Past gatherings below are real: dates come from the
// session titles on the Apostle's YouTube channel.

export type EventScope = "network" | "branch" | "itinerary";

export type RcnEvent = {
  slug: string;
  scope: EventScope;
  title: string;
  /** ISO dates (YYYY-MM-DD). Omitted for TBA. */
  startDate?: string;
  endDate?: string;
  dateText?: string;
  branch?: string;
  venue?: string;
  address?: string;
  city?: string;
  summary: string;
  speakers?: string[];
  schedule?: { time: string; title: string }[];
  registration?: boolean;
  capacity?: number;
  video?: string;
  playlistId?: string;
  /** Shown with a "Sample" label: design preview, not a real announcement. */
  sample?: boolean;
  confirm?: string;
};

export const sampleEvents: RcnEvent[] = [
  {
    slug: "marching-orders",
    scope: "network",
    sample: true,
    title: "Marching Orders Conference",
    dateText: "Dates TBA",
    summary:
      "RCN North America's national conference. Sessions from the most recent Marching Orders are below; the next conference's dates, venue and schedule will be announced here, with registration.",
    speakers: ["Apostle Arome Osayi"],
    registration: true,
    video: "conference",
    playlistId: "PLIV3hlanNdQY",
    confirm: "Next Marching Orders dates, venue, schedule, speakers and registration details.",
  },
];

export const pastGatherings: (RcnEvent & { videos: { id: string; label: string }[] })[] = [
  {
    slug: "marching-orders-2026",
    scope: "network",
    title: "Marching Orders 2026",
    startDate: "2026-08-14",
    endDate: "2026-08-15",
    summary: "Two days of sessions with Apostle Arome Osayi and Rev. Dinna Osayi.",
    videos: [
      { id: "pH0l4sA0qFw", label: "Day 1 · Evening" },
      { id: "kPvJa2iMdp0", label: "Day 2 · Morning" },
      { id: "YrxzqftWxIg", label: "Day 2 · Evening" },
    ],
  },
  {
    slug: "usa-apostolic-invasion-2025",
    scope: "network",
    title: "USA Apostolic Invasion: The Marching Orders",
    startDate: "2025-08-22",
    endDate: "2025-08-23",
    summary: "Including “Obeying God's Marching Orders”, the Day 1 message.",
    videos: [
      { id: "km5HWqG5U_s", label: "Obeying God's Marching Orders" },
      { id: "tlRiWQ0A_MA", label: "Day 1" },
      { id: "Ei4B2ep_e54", label: "Day 2 · Evening" },
    ],
  },
  {
    slug: "rcnna-partners-conference-2025",
    scope: "network",
    title: "RCNNA Partners Conference",
    startDate: "2025-03-14",
    endDate: "2025-03-15",
    summary: "The RCN North America Mission partners' gathering.",
    videos: [
      { id: "zCUKH9l0dv4", label: "Day 1" },
      { id: "BTqyIigfIGw", label: "Day 2" },
    ],
  },
];

export function formatEventDate(e: Pick<RcnEvent, "startDate" | "endDate" | "dateText">) {
  if (!e.startDate) return e.dateText ?? "Dates TBA";
  const f = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", ...o });
  if (e.endDate && e.endDate !== e.startDate) {
    const sameMonth = e.startDate.slice(0, 7) === e.endDate.slice(0, 7);
    const year = e.endDate.slice(0, 4);
    return sameMonth
      ? `${f(e.startDate, { month: "long", day: "numeric" })}–${Number(e.endDate.slice(8, 10))}, ${year}`
      : `${f(e.startDate, { month: "short", day: "numeric" })} – ${f(e.endDate, { month: "short", day: "numeric" })}, ${year}`;
  }
  return f(e.startDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
