import "server-only";
import { sbSelect, supabaseEnabled } from "./supabase";

// Published, moderated content from Supabase. Nothing is seeded (PRD §9): these return [] until
// the team publishes something, and every page shows a designed empty state meanwhile.

export type Testimony = { id: string; name: string | null; title: string | null; testimony: string; branch: string | null; published_at: string };
export type Newsletter = { id: string; title: string; summary: string | null; url: string | null; published_at: string };
export type Album = { id: string; title: string; event_date: string | null; cover_url: string | null; branch: string | null; items: { url: string; alt: string | null }[] };

async function safe<T>(table: string, query: string): Promise<T[]> {
  if (!supabaseEnabled) return [];
  try {
    return await sbSelect<T>(table, query, 300);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const getTestimonies = () => safe<Testimony>("testimonies_public", "select=*&order=published_at.desc&limit=60");
export const getNewsletters = () => safe<Newsletter>("newsletters", "select=*&is_published=eq.true&order=published_at.desc&limit=60");
export const getAlbums = () => safe<Album>("gallery_albums_public", "select=*&order=event_date.desc&limit=40");
