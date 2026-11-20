import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { Icon, PlaceholderMedia } from "@/components/ui";
import { logout } from "../actions";

export const metadata = pageMetadata({ title: "Team dashboard", description: "Private.", path: "/team/dashboard", noindex: true });

const sections = [
  { icon: "story", title: "Policies", body: "Network policies every branch follows.", docs: ["Network policy handbook", "Safeguarding policy", "Finance & stewardship policy"] },
  { icon: "check", title: "Guidelines", body: "How we run gatherings, media and communications.", docs: ["Branch operations guide", "Media & livestream guidelines", "Social media guidelines"] },
  { icon: "letter", title: "Forms", body: "Requests that go to network leadership.", docs: ["Refund request form", "Expense reimbursement", "Event approval request"] },
  { icon: "photo", title: "Brand assets", body: "Logos and templates for branches.", docs: ["RCN NA logo (SVG/PNG)", "Branch logo lockups", "Slide & flyer templates"] },
];

export default async function Dashboard() {
  const s = await getSession();
  if (!s) redirect("/team");
  const isAdmin = s.profile?.role === "network_admin" || s.profile?.role === "branch_admin";
  return (
    <section className="pb-24 pt-32 md:pt-40">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Team area</p>
            <h1 className="display text-[clamp(34px,4.7vw,62px)]">Welcome{s.profile?.full_name ? `, ${s.profile.full_name.split(" ")[0]}` : ""}.</h1>
            <p className="mt-2 text-muted">
              Signed in as {s.email}
              {s.preview ? " (preview access)" : ""}
              {s.profile ? ` · ${s.profile.role.replace("_", " ")}${s.profile.branch_slug ? ` · ${s.profile.branch_slug}` : ""}` : ""}
            </p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link href="/admin" className="btn-accent inline-flex min-h-12 items-center rounded-full px-6 text-[15px] font-semibold">
                Edit branch content
              </Link>
            )}
            <form action={logout}>
              <button className="inline-flex min-h-12 items-center rounded-full border border-line-strong px-6 text-[15px] font-semibold hover:border-ink">Sign out</button>
            </form>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {sections.map((x) => (
            <div key={x.title} className="rounded-3xl border border-line bg-surface p-7">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent-ink">
                  <Icon name={x.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="display text-[27px] leading-none">{x.title}</h2>
                  <p className="text-[14px] text-muted">{x.body}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2">
                {x.docs.map((d) => (
                  <li key={d} className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-accent/40 bg-accent/[0.04] px-4 py-3 text-[15px]">
                    <span>{d}</span>
                    <span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-accent-ink">Placeholder</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <PlaceholderMedia label="Documents, refund form fields and access list to come from the ministry" className="mt-6 min-h-[120px]" />
      </div>
    </section>
  );
}
