import Link from "next/link";
import { redirect } from "next/navigation";
import { asUser, getSession } from "@/lib/auth";
import { getBranch } from "@/content/branches";
import { pageMetadata } from "@/lib/seo";
import { moderateTestimony } from "../admin-actions";

export const metadata = pageMetadata({ title: "Inbox", description: "Private.", path: "/admin/inbox", noindex: true });

// Leaders see submissions for their own branch; network admins see everything. Row Level
// Security in Supabase enforces this, so the queries below can't over-fetch.
const TABS = [
  { key: "visits", label: "Planned visits", cols: ["created_at", "name", "email", "phone", "gathering", "visit_date", "adults", "kids", "notes"] },
  { key: "prayer_requests", label: "Prayer", cols: ["created_at", "name", "email", "phone", "request", "may_contact"] },
  { key: "contact_messages", label: "Messages", cols: ["created_at", "name", "email", "message"] },
  { key: "event_registrations", label: "Registrations", cols: ["created_at", "event", "name", "email", "phone", "attending", "notes"] },
  { key: "serve_signups", label: "Serve", cols: ["created_at", "team", "name", "email", "phone", "skills", "message"] },
  { key: "testimonies", label: "Testimonies", cols: ["created_at", "name", "title", "testimony", "consent_publish", "status"], networkOnly: true },
  { key: "newsletter_signups", label: "Newsletter", cols: ["created_at", "first_name", "email", "source"], networkOnly: true },
] as const;

export default async function Inbox({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const s = await getSession();
  if (!s) redirect("/team?next=/admin/inbox");
  const role = s.profile?.role;
  if (!s.token || (role !== "network_admin" && role !== "branch_admin")) redirect("/admin");
  const network = role === "network_admin";
  const tabs = TABS.filter((t) => network || !("networkOnly" in t));
  const { t } = await searchParams;
  const tab = tabs.find((x) => x.key === t) ?? tabs[0];
  const branchFilter = network ? "" : `&branch=eq.${s.profile!.branch_slug}`;
  const res = await asUser(s.token, `${tab.key}?select=*${tab.key === "newsletter_signups" ? "" : branchFilter}&order=created_at.desc&limit=200`);
  const rows: Record<string, unknown>[] = res.ok ? await res.json() : [];

  return (
    <section className="pb-24 pt-32 md:pt-40">
      <div className="wrap">
        <p className="eyebrow mb-3">{network ? "All branches" : getBranch(s.profile!.branch_slug ?? "")?.shortName}</p>
        <h1 className="display text-[clamp(34px,4vw,56px)]">Inbox</h1>
        <p className="mt-2 text-muted">Prayer requests are private: only your branch&apos;s leaders and network admins can read them.</p>
        <nav aria-label="Inbox sections" className="mt-6 flex flex-wrap gap-2">
          {tabs.map((x) => (
            <Link
              key={x.key}
              href={`/admin/inbox?t=${x.key}`}
              aria-current={x.key === tab.key ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-[14px] font-semibold ${x.key === tab.key ? "border-ink bg-ink text-on-night" : "border-line-strong hover:border-ink"}`}
            >
              {x.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
          {rows.length ? (
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="bg-surface-alt text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  {tab.cols.map((c) => (
                    <th key={c} className="px-4 py-3 font-bold">
                      {c.replace(/_/g, " ")}
                    </th>
                  ))}
                  {tab.key === "testimonies" && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={String(r.id)} className="align-top">
                    {tab.cols.map((c) => (
                      <td key={c} className="max-w-[340px] whitespace-pre-line px-4 py-3">
                        {c === "created_at" ? new Date(String(r[c])).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : typeof r[c] === "boolean" ? (r[c] ? "Yes" : "No") : String(r[c] ?? "")}
                      </td>
                    ))}
                    {tab.key === "testimonies" && (
                      <td className="px-4 py-3">
                        {r.status === "pending" && (
                          <div className="flex gap-2">
                            {Boolean(r.consent_publish) && (
                              <form action={moderateTestimony}>
                                <input type="hidden" name="id" value={String(r.id)} />
                                <input type="hidden" name="status" value="published" />
                                <button className="rounded-full bg-[#1e6b35] px-3 py-1 text-[13px] font-semibold text-white">Publish</button>
                              </form>
                            )}
                            <form action={moderateTestimony}>
                              <input type="hidden" name="id" value={String(r.id)} />
                              <input type="hidden" name="status" value="rejected" />
                              <button className="rounded-full border border-line-strong px-3 py-1 text-[13px] font-semibold">Reject</button>
                            </form>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-muted">Nothing here yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
