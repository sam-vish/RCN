import "server-only";
import type { Branch, Leader, Meeting } from "@/content/types";
import { branches } from "@/content/branches";
import { sbSelect, supabaseEnabled } from "./supabase";

/** Fields branch leaders can edit in /admin. Stored in Supabase `branch_content`, merged over content/branches.ts. */
export type BranchContent = {
  slug: string;
  what_to_expect: { title: string; body: string }[] | null;
  parking_notes: string[] | null;
  giving_url: string | null;
  whatsapp_url: string | null;
  telegram_url: string | null;
  chmeetings_url: string | null;
  hero_image_url: string | null;
  meetings: Meeting[] | null;
  leaders: Leader[] | null;
  updated_at?: string;
};

export async function getBranchContent(slug: string): Promise<BranchContent | null> {
  if (!supabaseEnabled) return null;
  try {
    const rows = await sbSelect<BranchContent>("branch_content", `select=*&slug=eq.${encodeURIComponent(slug)}`, 120);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Leader-edited values win over the static file; anything left blank keeps the default. */
export function withContent(b: Branch, c: BranchContent | null): Branch {
  if (!c) return b;
  const ext = { ...b.ext };
  if (c.what_to_expect?.length) {
    ext.whatToExpect = c.what_to_expect;
    ext.whatToExpectIsDraft = false;
  }
  if (c.parking_notes?.length) ext.parking = { lines: c.parking_notes };
  if (c.giving_url) {
    ext.givingUrl = c.giving_url;
    ext.givingConfirm = undefined;
  }
  if (c.hero_image_url) ext.heroImage = c.hero_image_url;
  if (c.chmeetings_url && ext.signature) ext.signature = { ...ext.signature, rsvpUrl: c.chmeetings_url };
  return {
    ...b,
    ...(c.meetings?.length ? { meetings: c.meetings } : {}),
    ...(c.leaders?.length ? { leaders: c.leaders } : {}),
    ext,
    socials: { ...b.socials, ...(c.whatsapp_url ? { whatsapp: c.whatsapp_url } : {}), ...(c.telegram_url ? { telegram: c.telegram_url } : {}) },
  };
}

/** Every branch with leader edits applied (one request), for schedules shown across the site. */
export async function getAllBranches(): Promise<Branch[]> {
  if (!supabaseEnabled) return branches;
  try {
    const rows = await sbSelect<BranchContent>("branch_content", "select=*", 120);
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    return branches.map((b) => withContent(b, bySlug.get(b.slug) ?? null));
  } catch {
    return branches;
  }
}
