import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { TestimonyForm } from "@/components/forms/forms";
import { getTestimonies } from "@/lib/published";
import { getBranch } from "@/content/branches";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Testimonies | Stories of God's Grace",
  description: "Real accounts of God's grace across RCN North America, reviewed and published by our team. Share your own story.",
  path: "/testimonies",
  ogTitle: "Testimonies",
});

export default async function TestimoniesPage() {
  const items = await getTestimonies();
  return (
    <>
      <PageHeader
        kicker="Stories of faith"
        title="Testimonies"
        intro="Real accounts of God's grace, reviewed and published by our team. New submissions are moderated before they appear here."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#share">Share your story</ButtonLink>
          <ButtonLink href="/prayer" variant="ghost">
            Request prayer
          </ButtonLink>
        </div>
      </PageHeader>

      <section className="py-14 md:py-20">
        <div className="wrap">
          {items.length ? (
            <ul className="columns-1 gap-5 md:columns-2 lg:columns-3">
              {items.map((t) => (
                <li key={t.id} className="mb-5 break-inside-avoid rounded-3xl border border-line bg-surface p-7">
                  <span aria-hidden className="display block text-[50px] leading-[0.5] text-accent">“</span>
                  {t.title && <p className="display mt-2 text-[22px] leading-tight">{t.title}</p>}
                  <p className="mt-3 whitespace-pre-line text-ink/85">{t.testimony}</p>
                  <p className="mt-5 text-[14px] text-muted">
                    {t.name ?? "A member"}
                    {t.branch ? ` · ${getBranch(t.branch)?.shortName ?? ""}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="story"
              title="Stories are on the way."
              body="Published testimonies will show here after our team reviews them. You can still share your story below—we'd love to hear what God has done."
            />
          )}
        </div>
      </section>

      <section id="share" className="scroll-mt-24 border-t border-line bg-surface-alt py-16 md:py-24">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-3">Submit</p>
            <h2 className="display text-[clamp(31px,3.9vw,50px)]">Share your testimony</h2>
            <p className="mt-4 max-w-md text-muted">
              Your story is sent to our team for review. We may contact you before anything is published. Nothing you submit here appears on this page until our team publishes it.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-surface p-6 md:p-10">
            <TestimonyForm />
          </div>
        </div>
      </section>
    </>
  );
}
