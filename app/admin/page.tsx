import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { branches, getBranch } from "@/content/branches";
import { getBranchContent } from "@/lib/branch-content";
import { defaultWhatToExpect } from "@/content/words";
import { pageMetadata } from "@/lib/seo";
import { BranchEditor } from "./BranchEditor";

export const metadata = pageMetadata({ title: "Branch admin", description: "Private.", path: "/admin", noindex: true });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const s = await getSession();
  if (!s) redirect("/team?next=/admin");
  const { branch } = await searchParams;

  const role = s.profile?.role;
  if (s.preview || (role !== "network_admin" && role !== "branch_admin")) {
    return (
      <section className="pb-24 pt-40">
        <div className="wrap max-w-2xl">
          <h1 className="display text-[44px]">Branch admin</h1>
          <p className="mt-4 text-muted">
            {s.preview
              ? "Editing needs a real account (Supabase sign-in). Preview access can view the team area only."
              : "Your account doesn't have an admin role yet. Ask a network admin to set your role in the profiles table."}
          </p>
          <Link href="/team/dashboard" className="mt-6 inline-block font-semibold text-accent-ink">
            ← Back to the team area
          </Link>
        </div>
      </section>
    );
  }

  const editable = role === "network_admin" ? branches : branches.filter((b) => b.slug === s.profile?.branch_slug);
  const current = getBranch(branch ?? "") && editable.some((b) => b.slug === branch) ? getBranch(branch!)! : editable[0];
  if (!current) return null;
  const content = await getBranchContent(current.slug);

  return (
    <section className="pb-24 pt-32 md:pt-40">
      <div className="wrap grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside>
          <p className="eyebrow mb-3">{role === "network_admin" ? "Network admin" : "Branch admin"}</p>
          <ul className="space-y-1">
            {editable.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/admin?branch=${b.slug}`}
                  aria-current={b.slug === current.slug ? "page" : undefined}
                  className={`block rounded-xl px-4 py-2.5 text-[15px] font-semibold ${b.slug === current.slug ? "bg-ink text-on-night" : "hover:bg-surface-alt"}`}
                >
                  {b.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div>
          <h1 className="display text-[clamp(34px,3.9vw,56px)]">{current.shortName}</h1>
          <p className="mt-2 text-muted">
            Changes go live on the branch page within two minutes.{" "}
            <Link href={`/branches/${current.slug}`} className="font-semibold text-accent-ink underline-offset-4 hover:underline" target="_blank">
              View page ↗
            </Link>
          </p>
          <div className="mt-8 rounded-3xl border border-line bg-surface p-6 md:p-10">
            <BranchEditor
              slug={current.slug}
              meetings={content?.meetings?.length ? content.meetings : current.meetings}
              leaders={content?.leaders?.length ? content.leaders : current.leaders}
              initial={{
                what_to_expect: (content?.what_to_expect ?? current.ext.whatToExpect ?? defaultWhatToExpect).map((x) => `${x.title}: ${x.body}`).join("\n"),
                parking_notes: (content?.parking_notes ?? current.ext.parking?.lines ?? []).join("\n"),
                giving_url: content?.giving_url ?? current.ext.givingUrl ?? "",
                whatsapp_url: content?.whatsapp_url ?? current.socials.whatsapp ?? "",
                telegram_url: content?.telegram_url ?? current.socials.telegram ?? "",
                chmeetings_url: content?.chmeetings_url ?? "",
                hero_image_url: content?.hero_image_url ?? "",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
