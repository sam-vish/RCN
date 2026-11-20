"use server";

import { revalidatePath } from "next/cache";
import { asUser, getSession } from "@/lib/auth";
import { getBranch } from "@/content/branches";

export type ActionState = { ok?: boolean; error?: string };

const s = (fd: FormData, k: string, max = 400) => String(fd.get(k) ?? "").trim().slice(0, max);
const slugify = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .slice(0, 70);

async function admin() {
  const sess = await getSession();
  if (!sess?.token || !sess.profile || !["network_admin", "branch_admin"].includes(sess.profile.role)) return null;
  return sess;
}

/** Create or update an event. Branch admins can only post events for their own branch (RLS enforces it too). */
export async function saveEvent(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const sess = await admin();
  if (!sess) return { error: "Sign in again." };
  const network = sess.profile!.role === "network_admin";
  const scope = network ? s(fd, "scope", 20) || "network" : "branch";
  const branch_slug = network ? s(fd, "branch_slug", 60) || null : sess.profile!.branch_slug;
  if (scope === "branch" && (!branch_slug || !getBranch(branch_slug))) return { error: "Choose the branch hosting this event." };
  const title = s(fd, "title", 140);
  const start = s(fd, "start_date", 10);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(start)) return { error: "Title and start date are required." };
  const end = s(fd, "end_date", 10);
  const id = s(fd, "id", 60);
  const row = {
    scope,
    branch_slug: scope === "branch" ? branch_slug : null,
    title,
    slug: s(fd, "slug", 80) || `${slugify(title)}-${start.slice(0, 4)}`,
    start_at: `${start}T12:00:00Z`,
    end_at: /^\d{4}-\d{2}-\d{2}$/.test(end) ? `${end}T12:00:00Z` : null,
    venue: s(fd, "venue", 160) || null,
    address: s(fd, "address", 200) || null,
    city: s(fd, "city", 80) || null,
    description: s(fd, "description", 3000) || null,
    registration_enabled: fd.get("registration_enabled") === "on",
    capacity: Number(s(fd, "capacity", 6)) || null,
    is_published: fd.get("is_published") === "on",
  };
  const res = id
    ? await asUser(sess.token!, `events?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row) })
    : await asUser(sess.token!, "events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row) });
  if (!res.ok) return { error: `Couldn't save (${res.status}). ${res.status === 409 ? "That URL slug is taken; change the title or slug." : ""}` };
  revalidatePath("/events");
  revalidatePath("/admin/events");
  if (row.branch_slug) revalidatePath(`/branches/${row.branch_slug}`);
  return { ok: true };
}

export async function deleteEvent(fd: FormData) {
  const sess = await admin();
  if (!sess) return;
  await asUser(sess.token!, `events?id=eq.${encodeURIComponent(s(fd, "id", 60))}`, { method: "DELETE" });
  revalidatePath("/events");
  revalidatePath("/admin/events");
}

/** Network admins publish or reject testimonies (only consented ones can be published). */
export async function moderateTestimony(fd: FormData) {
  const sess = await admin();
  if (!sess || sess.profile!.role !== "network_admin") return;
  const status = s(fd, "status", 20);
  if (!["published", "rejected"].includes(status)) return;
  await asUser(sess.token!, `testimonies?id=eq.${encodeURIComponent(s(fd, "id", 60))}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status, published_at: status === "published" ? new Date().toISOString() : null }),
  });
  revalidatePath("/testimonies");
  revalidatePath("/admin/inbox");
}
