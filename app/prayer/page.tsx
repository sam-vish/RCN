import Link from "next/link";
import { PageHeader, Icon } from "@/components/ui";
import { PrayerForm } from "@/components/forms/forms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Prayer Requests | We'll Stand With You",
  description: "Share what you're carrying. Prayer requests are kept private and seen only by authorized leaders of your branch, never on the public website.",
  path: "/prayer",
  ogTitle: "Prayer requests",
});

export default function PrayerPage() {
  return (
    <>
      <PageHeader
        kicker="Intercession"
        title="Prayer requests"
        intro="Share what you're carrying. Requests are kept private and are seen only by authorized leaders in the leadership team—not on the public website."
      />
      <section className="py-14 md:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-line bg-surface p-6 md:p-10">
            <h2 className="display mb-2 text-[31px]">Submit a request</h2>
            <p className="mb-8 text-muted">Name and contact fields are optional but help us follow up if you&apos;d like pastoral care.</p>
            <PrayerForm />
          </div>
          <aside className="space-y-4">
            {[
              ["lock", "Private by design", "Only the leaders of the branch you choose (and network leadership) can read your request."],
              ["pin", "Routed to your branch", "Pick your branch and its prayer team receives it directly. Not sure? Network leaders will pray and pass it on."],
              ["heart", "Prayer that contends", "We carry the prayer commission of the church: standing in the gap until earth feels it."],
            ].map(([icon, title, body]) => (
              <div key={title} className="flex gap-4 rounded-3xl border border-line bg-surface p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink">
                  <Icon name={icon} />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-[15px] text-muted">{body}</p>
                </div>
              </div>
            ))}
            <div className="rounded-3xl bg-night p-6 text-on-night">
              <p className="font-semibold">Have a story to tell?</p>
              <p className="mt-1 text-[15px] text-on-night-muted">Use the testimonies page to submit something meant for the public wall after review.</p>
              <Link href="/testimonies" className="mt-4 inline-block font-semibold text-gold">
                Share a testimony →
              </Link>
            </div>
            <p className="px-2 text-[13px] text-muted">In an emergency, please contact your local emergency services.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
