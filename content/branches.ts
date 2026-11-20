import { branchData } from "./branches.data";
import { defaultWhatToExpect } from "./words";
import type { Branch, BranchExtensions } from "./types";

/**
 * Per-branch extensions. The template renders a section only when its data exists, so a branch
 * with just a name, city and one meeting still gets a complete-looking page.
 *
 * Sources: PRD §6.7/6.8 (client brief), the live site, and the branches' own YouTube streams.
 * Anything not confirmed by the branch carries a `confirm` note (shown as a dashed marker).
 */
const extensions: Record<string, BranchExtensions> = {
  boston: {
    heroVideo: "boston",
    accent: "#A3312A",
    logoWord: "Boston",
    tagline: "Apostolic teaching and community in the Greater Boston area.",
    youtubeChannelId: "UCVD3b1UwhKYr3008c64FiAA",
    parking: {
      lines: [
        "Littleton sits outside the city, northwest of Boston. Most people drive in via Route 2 or I-495.",
        "By train: the MBTA Fitchburg Line stops at Littleton/Route 495 station.",
      ],
      confirm: "Parking and transit notes are from the brief. Confirm with the Boston team (where to park, entrance, rides from the station).",
    },
    whatToExpect: defaultWhatToExpect,
    whatToExpectIsDraft: true,
  },

  "orlando-florida": {
    heroVideo: "orlando",
    accent: "#3D5AFE",
    logoWord: "Florida",
    tagline: "Central Florida gatherings for prayer and spiritual formation.",
    youtubeChannelId: "UC5MWMEqJ0e100z9iY2kPO9Q",
    givingUrl: "https://secure.qgiv.com/for/remnantchristiannetworkorlandoflorida/",
    givingConfirm: "This Qgiv link is from the giving slide in RCN Orlando's Dec 2025 livestream. Confirm it's current.",
    signature: {
      name: "7 Hours Apostolic Gathering",
      altName: "7 Hour Prayer",
      meetingTitle: "7 Hour Prayer",
      summary:
        "Seven hours of prayer and apostolic ministry, in person in Orlando on the last Saturday of the month, 9:00 AM to 4:00 PM.",
      expect: [
        "Seven unbroken hours: prayer, worship and the Word",
        "In person at 12150 Pioneers Way, Orlando",
        "Come for the whole day; let us know you're coming so we can plan",
      ],
      confirm:
        "Preferred name (live site: \"7 Hour Prayer\"; brief: \"7 Hours Apostolic Gathering\") and cadence (live site: last Saturday monthly; Dec 2025 stream slide: \"Last Saturday (bi-monthly)\"). ChMeetings RSVP link needed.",
    },
    weeklyClasses: {
      intro: "Through the week, RCN Florida meets online for discipleship, foundations and prayer.",
      items: [
        { day: "Monday", title: "Discipleship", summary: "Growing in the apostolic life, week by week." },
        { day: "Wednesday", title: "Foundations", summary: "The doctrines every believer should be grounded in." },
        { day: "Friday", title: "Prayer", summary: "The branch gathers online to pray." },
      ],
      confirm:
        "Class times and join links needed. The Dec 2025 stream slide listed Daily Prayers and Wednesday Bible Study, 10 PM to 12 AM on Zoom: confirm which schedule is current.",
    },
    kids: {
      title: "Kids, newborn to 15",
      points: ["Rooms for newborns through age 15", "Safe check-in", "A screened, trained team"],
    },
    serveDepartments: ["Worship", "Protocol", "Hospitality", "Children", "Media"],
    whatToExpect: defaultWhatToExpect,
    whatToExpectIsDraft: true,
    notes: [
      "WhatsApp community link decoded from the QR code in RCN Orlando's Dec 2025 livestream.",
    ],
  },

  "houston-texas": { playlistId: "PL5LRQf8qfkyvs_K6W8Lgo8Y5_kHX6Gdgw", youtubeChannelId: "UCC50R_tl9JviAnWjcX7W6uw" },
  "maryland-dmv": { playlistId: "PL5LRQf8qfkyukxQ0Hc64ImovfOBFXEspZ" },
  california: { playlistId: "PL5LRQf8qfkysm3bXQMCmDjiYjeaEH9gGQ" },
  "dallas-texas": { playlistId: "PL5LRQf8qfkyszUVgkF_YWrg-aY-H4GIOX" },
  tulsa: { playlistId: "PL5LRQf8qfkyvvRp44ZAXe-UdW7gVPWUc_" },
  "new-york": { playlistId: "PL5LRQf8qfkyuYjDW8vMRZFVdc_t_Uay-F" },
  minnesota: { playlistId: "PL5LRQf8qfkytdNvjX99oacrKtR49eLkSv", youtubeChannelId: "UCjDkFYAXci9ec7-4Rzh3PNw" },
  canada: { playlistId: "PL5LRQf8qfkytrJK6_IMRIsMV9U02vbmzj" },
  "oklahoma-city": { playlistId: "PL5LRQf8qfkyvxwzaa8ZE0MzN1gDktURi-" },
};

/** Orlando's WhatsApp community (from its own livestream slide), added to the scraped socials. */
const extraSocials: Record<string, Partial<Branch["socials"]>> = {
  "orlando-florida": { whatsapp: "https://chat.whatsapp.com/DsHFlHr66PVJoz2WM6wH3Z" },
};

export const branches: Branch[] = branchData.map((b) => ({
  ...b,
  socials: { ...b.socials, ...extraSocials[b.slug] },
  meetings: b.meetings.map((m) =>
    b.slug === "orlando-florida" && m.title === "7 Hour Prayer" ? { ...m, signature: true } : m,
  ),
  ext: extensions[b.slug] ?? {},
}));

export function getBranch(slug: string) {
  return branches.find((b) => b.slug === slug);
}

/** Short aliases from the client brief (/boston, /florida) → canonical branch routes. */
export const branchAliases: Record<string, string> = {
  boston: "boston",
  florida: "orlando-florida",
  orlando: "orlando-florida",
};

/** The two showcase branches lead every list. */
export const featuredSlugs = ["boston", "orlando-florida"];

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearbyBranches(branch: Branch, n = 3) {
  return branches
    .filter((b) => b.slug !== branch.slug)
    .map((b) => ({ b, km: distanceKm(branch, b) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, n);
}

export function branchLabel(b: Pick<Branch, "city" | "region">) {
  return `${b.city}, ${b.region}`;
}
