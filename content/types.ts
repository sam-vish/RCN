// Shared content types. These mirror the Supabase tables in supabase/schema.sql so the
// static content in /content can move into the database without touching components.

export type Weekday = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export type Recurrence =
  | { kind: "weekly" }
  | { kind: "daily" }
  /** nth weekday of the month; -1 = last. e.g. [1, 3, 5] = first, third and fifth. */
  | { kind: "nth"; n: number[] }
  /** Every other week: can't compute without an anchor date, so no countdown. */
  | { kind: "biweekly" }
  /** Dates are set ad hoc by the branch. */
  | { kind: "unscheduled" };

export type Meeting = {
  title: string;
  day: Weekday | "Daily";
  /** 24h "HH:MM" in the branch's own timezone. */
  start?: string;
  end?: string;
  /** For times that aren't a clock time ("Every 3 hours", "Time announced monthly"). */
  timeText?: string;
  /** IANA timezone, e.g. America/New_York. */
  timezone: string;
  recurrence: Recurrence;
  note?: string;
  /** Present when the meeting is online (Zoom etc). Empty object = online, link not public. */
  online?: { url?: string; meetingId?: string; passcode?: string };
  /** ISO date after which the meeting is hidden (one-off seasons like a 21-day fast). */
  activeUntil?: string;
  /** Shown as a "To confirm" marker. */
  confirm?: string;
  /** Signature gatherings get the big countdown treatment. */
  signature?: boolean;
};

export type Leader = { name: string; title: string; photo?: string; bio?: string };

export type Socials = {
  instagram?: string;
  youtube?: string;
  facebook?: string;
  whatsapp?: string;
  telegram?: string;
};

export type BranchBase = {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  address: string;
  emails: string[];
  phones: string[];
  description: string;
  leaders: Leader[];
  meetings: Meeting[];
  socials: Socials;
  /** Long-form copy from the branch's own page. "## " = heading, "- " = list item. */
  overview?: string[];
  isHQ?: boolean;
};

export type WeeklyClass = { day: Weekday; title: string; summary?: string; time?: string; joinUrl?: string };

export type BranchExtensions = {
  /** Name of a loop in /public/video used behind the branch hero. */
  heroVideo?: string;
  heroImage?: string;
  /** Local accent pulled from the branch's own logo/graphics. */
  accent?: string;
  /** Branch logo lockup: the RCN mark + "Remnant Christian Network" + this word. */
  logoWord?: string;
  tagline?: string;
  youtubeChannelId?: string;
  /** Playlist on the Apostle's channel with messages at this branch. */
  playlistId?: string;
  givingUrl?: string;
  givingConfirm?: string;
  parking?: { lines: string[]; confirm?: string };
  whatToExpect?: { title: string; body: string }[];
  whatToExpectIsDraft?: boolean;
  weeklyClasses?: { intro?: string; items: WeeklyClass[]; confirm?: string };
  signature?: {
    name: string;
    altName?: string;
    meetingTitle: string;
    summary: string;
    expect: string[];
    rsvpUrl?: string;
    confirm?: string;
  };
  kids?: { title: string; points: string[] };
  serveDepartments?: string[];
  chmeetingsUrl?: string;
  notes?: string[];
};

export type Branch = BranchBase & { ext: BranchExtensions };
