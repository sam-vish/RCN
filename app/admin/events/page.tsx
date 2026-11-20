import { redirect } from "next/navigation";
import { asUser, getSession } from "@/lib/auth";
import { branches } from "@/content/branches";
import { pageMetadata } from "@/lib/seo";
import { EventForm } from "../EventForm";
import { deleteEvent } from "../admin-actions";

export const metadata = pageMetadata({ title: "Events admin", description: "Private.", path: "/admin/events", noindex: true });

type Row = {
  id: string;
  title: string;
  slug: string;
  scope: string;
  branch_slug: string | null;
  start_at: string | null;
  end_at: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  description: string | null;
  registration_enabled: boolean | null;
  capacity: number | null;
  is_published: boolean | null;
};

export default async function EventsAdmin() {
  const s = await getSession();
  if (!s) redirect("/team?next=/admin/events");
  const role = s.profile?.role;
  if (!s.token || (role !== "network_admin" && role !== "branch_admin")) redirect("/admin");
  const network = role === "network_admin";
  const q = network ? "events?select=*&order=start_at.desc&limit=100" : `events?select=*&branch_slug=eq.${s.profile!.branch_slug}&order=start_at.desc&limit=100`;
  const res = await asUser(s.token, q);
  const rows: Row[] = res.ok ? await res.json() : [];
  const opts = branches.map((b) => ({ slug: b.slug, name: b.shortName }));

  return (
    <section className="pb-24 pt-32 md:pt-40">
      <div className="wrap max-w-4xl">
        <p className="eyebrow mb-3">{network ? "Network admin" : "Branch admin"}</p>
        <h1 className="display text-[clamp(34px,4vw,56px)]">Events</h1>
        <p className="mt-2 text-muted">Published events appear on /events{network ? "" : " and your branch page"} within five minutes. Registrations arrive in the Inbox.</p>

        <div className="mt-8 rounded-3xl border border-line bg-surface p-6 md:p-8">
          <h2 className="mb-5 text-[18px] font-semibold">New event</h2>
          <EventForm network={network} branches={opts} />
        </div>

        <h2 className="mt-12 mb-4 text-[18px] font-semibold">{rows.length ? "Existing events" : "No events yet"}</h2>
        <ul className="space-y-3">
          {rows.map((e) => (
            <li key={e.id}>
              <details className="rounded-2xl border border-line bg-surface p-5">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <span>
                    <span className="font-semibold">{e.title}</span>
                    <span className="ml-2 text-[13px] text-muted">
                      {e.start_at?.slice(0, 10)} · {e.scope}
                      {e.branch_slug ? ` · ${e.branch_slug}` : ""}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${e.is_published ? "bg-[#e6f4ea] text-[#1e6b35]" : "bg-surface-alt text-muted"}`}>{e.is_published ? "Published" : "Draft"}</span>
                </summary>
                <div className="mt-5 border-t border-line pt-5">
                  <EventForm ev={e} network={network} branches={opts} />
                  <form action={deleteEvent} className="mt-4">
                    <input type="hidden" name="id" value={e.id} />
                    <button className="text-[13px] font-semibold text-[#b42318] hover:underline">Delete this event</button>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
