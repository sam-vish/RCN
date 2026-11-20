import { Suspense } from "react";
import { EmptyState, PageHeader, Icon } from "@/components/ui";
import { GivingRouter } from "@/components/forms/GivingRouter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Give | Partner with the Gospel in North America",
  description: "Give to RCN North America or directly to your local branch. Your generosity helps carry the Word, serve communities, and strengthen local churches.",
  path: "/giving",
  ogTitle: "Partner with the gospel in North America",
});

export default async function GivingPage({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const { branch } = await searchParams;
  return (
    <>
      <PageHeader
        kicker="Giving"
        title="Partner with the gospel in North America"
        intro="Your generosity helps carry the Word, serve communities, and strengthen local churches. Give nationally or to a specific branch."
      />
      <section className="py-14 md:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <Suspense>
            <GivingRouter initial={branch} />
          </Suspense>
          <div className="space-y-5">
            <div className="rounded-3xl bg-night p-8 text-on-night">
              <p className="display text-[27px] leading-tight">“Give, and it shall be given unto you.”</p>
              <p className="mt-2 text-[14px] text-on-night-muted">Luke 6:38 (KJV)</p>
            </div>
            <ul className="space-y-3 text-[15px]">
              {[
                ["lock", "We never ask for card or bank details on this site. You give on your branch's own secure page."],
                ["heart", "Gifts to a branch support that local church. National gifts support RCN North America's mission and conferences."],
                ["mail", "Questions about giving? Write to your branch, or use the contact form on its page."],
              ].map(([icon, text]) => (
                <li key={text} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                  <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-alt py-16 md:py-20">
        <div className="wrap grid gap-5 lg:grid-cols-3">
          <div>
            <p className="eyebrow mb-3">Ways to give</p>
            <h2 className="display text-[31px] leading-tight">Giving methods</h2>
            <p className="mt-3 text-muted">Online, in person at a gathering, or recurring. Methods appear here as each branch&apos;s giving page goes live.</p>
          </div>
          <EmptyState icon="gift" title="Current giving goals" body="Active goals, such as a building fund or a conference, will appear here with progress, once the team publishes them." />
          <EmptyState icon="letter" title="Stewardship updates" body="How gifts are used: transparency notes from the team will be published here." />
        </div>
      </section>
    </>
  );
}
