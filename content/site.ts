// Network-wide links and settings. Everything here is taken from the live rcnnorthamerica.com
// (Nov 2026) or the Apostle's public channels. Nothing invented.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.rcnnorthamerica.com").replace(/\/$/, "");

/** Show dashed "To confirm" markers. Turn off for production once the open items are resolved. */
export const SHOW_PENDING = process.env.NEXT_PUBLIC_SHOW_PENDING !== "false";

export const site = {
  name: "RCN North America",
  legalName: "Remnant Christian Network North America",
  tagline: "Striving for the rebirth of Apostolic Christianity.",
  intro: "A growing fellowship of branches across the United States and Canada. Come as you are.",
  mission:
    "RCN North America is an interdenominational ministry restoring the order of the first generation of apostles — through prayer, the Word, and fellowship.",
  hq: {
    name: "Minnesota",
    address: "4215 Fairview Avenue, Minnetonka, MN 55343",
    slug: "minnesota",
  },
  apostleChannelId: "UCh6Sn6v_mdhwWTEpNvo5A4A",
  links: {
    aao: "https://www.aromeosayi.org",
    rcnGlobal: "https://rcnglobal.org/",
    bookstore: "https://aaobooks.com",
    youtube: "https://www.youtube.com/@ApostleAromeOsayi",
    telegram: "https://t.me/Apostlearome",
    instagram: "https://www.instagram.com/rcnamerica/",
    facebook: "https://www.facebook.com/RemnantChristianNetworkNorthAmerica/",
    rumble: "https://rumble.com/user/ApostleAromeOsayi",
    twitch: "https://www.twitch.tv/apostlearomeosayi",
  },
};

export const socials = [
  { name: "YouTube", href: site.links.youtube, icon: "youtube" },
  { name: "Instagram", href: site.links.instagram, icon: "instagram" },
  { name: "Facebook", href: site.links.facebook, icon: "facebook" },
  { name: "Telegram", href: site.links.telegram, icon: "telegram" },
];

export const primaryNav = [
  { href: "/about-us", label: "About" },
  { href: "/locations", label: "Locations" },
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/serve", label: "Serve" },
];

export const moreNav = [
  { href: "/prayer", label: "Prayer", blurb: "Private requests, routed to your branch" },
  { href: "/testimonies", label: "Testimonies", blurb: "Stories of what God has done" },
  { href: "/newsletters", label: "Newsletters", blurb: "Letters and announcements" },
  { href: "/gallery", label: "Gallery", blurb: "Moments from our gatherings" },
  { href: "https://aaobooks.com", label: "Bookstore", blurb: "Books by Apostle Arome Osayi" },
];

/** Footer credit: needs sign-off from Minister Mica-El Mumba before launch (PRD §8). */
export const footerCredit = "Built by Oasis Strategy × BrainChain Labs";
