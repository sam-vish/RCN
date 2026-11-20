import { EmptyState, PageHeader } from "@/components/ui";
import { NewsletterForm } from "@/components/forms/forms";
import { getNewsletters } from "@/lib/published";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Newsletters | Letters & Announcements",
  description: "Ministry letters, announcements and encouragement from RCN North America. Subscribe to get the next one by email.",
  path: "/newsletters",
  ogTitle: "Newsletters",
});

export default async function NewslettersPage() {
  const items = await getNewsletters();
  return (
    <>
      <PageHeader kicker="Updates" title="Newsletters" intro="Read the latest ministry letters, announcements, and encouragement from our team." />
      <section className="py-14 md:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {items.length ? (
              <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
                {items.map((n) => (
                  <li key={n.id}>
                    <a href={n.url ?? "#"} target={n.url ? "_blank" : undefined} rel="noopener noreferrer" className="group block p-7 hover:bg-surface-alt">
                      <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-muted">
                        {new Date(n.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="display mt-2 text-[25px] group-hover:text-accent-ink">{n.title}</p>
                      {n.summary && <p className="mt-2 text-muted">{n.summary}</p>}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="letter" title="No published newsletters yet." body="Sign up and the very first letter comes straight to your inbox." />
            )}
          </div>
          <aside className="h-fit rounded-3xl bg-night p-8 text-on-night lg:sticky lg:top-28">
            <p className="eyebrow mb-3">Subscribe</p>
            <p className="display text-[31px] leading-tight">Get the next one by email.</p>
            <p className="mb-6 mt-2 text-on-night-muted">Conferences, branch gatherings and new messages.</p>
            <NewsletterForm source="newsletters" tone="night" />
          </aside>
        </div>
      </section>
    </>
  );
}
