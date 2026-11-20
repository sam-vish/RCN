import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

// Invite-only sign-in for the team area and branch admin (PRD §6.12/6.13).
// Supabase Auth over REST: there is no public sign-up; accounts are invited from the Supabase
// dashboard. Tokens live in httpOnly cookies. Roles come from the `profiles` table (RLS).
//
// TEAM_PREVIEW_PASSWORD (optional) lets the ministry click through the placeholder team area in
// a preview without Supabase. It grants no data access and never works for /admin.

const URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const ANON = process.env.SUPABASE_ANON_KEY;
export const authEnabled = Boolean(URL && ANON);
export const previewLoginEnabled = Boolean(process.env.TEAM_PREVIEW_PASSWORD);

const AT = "rcn-at";
const RT = "rcn-rt";
const PV = "rcn-preview";

export type Profile = { role: "network_admin" | "branch_admin" | "team"; branch_slug: string | null; full_name: string | null };
export type Session = { email: string; token?: string; preview?: boolean; profile?: Profile | null };

const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

function sign(v: string) {
  return createHmac("sha256", process.env.TEAM_PREVIEW_PASSWORD || "x").update(v).digest("hex");
}

export async function passwordSignIn(email: string, password: string): Promise<string | null> {
  const jar = await cookies();
  if (!authEnabled) {
    const pw = process.env.TEAM_PREVIEW_PASSWORD;
    if (pw && password.length === pw.length && timingSafeEqual(Buffer.from(password), Buffer.from(pw))) {
      const v = `${email}|${Date.now()}`;
      jar.set(PV, `${v}|${sign(v)}`, { ...cookieOpts, maxAge: 60 * 60 * 8 });
      return null;
    }
    return previewLoginEnabled ? "Email or password is incorrect." : "Sign-in isn't configured on this preview yet.";
  }
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON!, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) return "Email or password is incorrect.";
  const d = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  jar.set(AT, d.access_token, { ...cookieOpts, maxAge: d.expires_in });
  jar.set(RT, d.refresh_token, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
  return null;
}

export async function signOut() {
  const jar = await cookies();
  for (const c of [AT, RT, PV]) jar.delete(c);
}

async function getUser(token: string) {
  const res = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: ANON!, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as { id: string; email: string };
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const pv = jar.get(PV)?.value;
  if (pv && previewLoginEnabled) {
    const [email, ts, sig] = pv.split("|");
    if (sig && sign(`${email}|${ts}`) === sig) return { email, preview: true };
  }
  if (!authEnabled) return null;
  const token = jar.get(AT)?.value;
  if (!token) return null;
  const user = await getUser(token);
  if (!user) return null;
  const pr = await fetch(`${URL}/rest/v1/profiles?select=role,branch_slug,full_name&id=eq.${user.id}`, {
    headers: { apikey: ANON!, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const profile = pr.ok ? (((await pr.json()) as Profile[])[0] ?? null) : null;
  return { email: user.email, token, profile };
}

/** PostgREST call as the signed-in user, so Row Level Security decides what they can change. */
export async function asUser(token: string, path: string, init: RequestInit = {}) {
  return fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: ANON!, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
}

export const AUTH_COOKIES = { AT, RT, PV };
