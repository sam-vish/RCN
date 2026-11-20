import { PageHeader, Icon } from "@/components/ui";
import { ServeForm } from "@/components/forms/forms";
import { serveDepartments } from "@/content/words";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Serve | Tech & Systems Team and Branch Departments",
  description: "Serve with RCN North America: join the tech & systems team behind the network, or a department at your branch: worship, protocol, hospitality, children or media.",
  path: "/serve",
  ogTitle: "Serve with RCN North America",
  ogImage: "conference",
});

const tech = [
  ["video", "Livestream & media", "Cameras, streaming, editing, and getting messages to YouTube."],
  ["search", "Web & data", "This website, branch pages, forms, and the systems behind them."],
  ["users", "Systems & operations", "Registration, check-in, communications and the tools each branch runs on."],
];

const deptBlurb: Record<string, string> = {
  Worship: "Singers and musicians who lead the congregation into God's presence.",
  Protocol: "Order, ushering and care for guests and ministers at every gathering.",
  Hospitality: "Welcome, refreshments and the table where community happens.",
  Children: "Teaching and caring for the next generation, with a screened team.",
  Media: "Photography, video and livestream for your branch.",
};

export default function ServePage() {
  return (
    <>
      <PageHeader video="worship" kicker="Serve" title="There's a place for your gifts." intro="From the tech & systems team that keeps the network running to the departments that make each gathering feel like home." />

      <section aria-labelledby="tech-h" className="py-16 md:py-24">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow mb-3">Network team</p>
            <h2 id="tech-h" className="display text-[clamp(31px,3.9vw,50px)]">
              Tech &amp; systems team
            </h2>
            <p className="mt-4 max-w-lg text-muted">A national volunteer team serving every branch. If you build, stream, design or organize, there&apos;s work here that carries the Word further.</p>
            <ul className="mt-8 space-y-3">
              {tech.map(([icon, t, b]) => (
                <li key={t} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink">
                    <Icon name={icon} />
                  </span>
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="text-[15px] text-muted">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-surface p-6 md:p-10">
            <h3 className="display mb-6 text-[28px]">Join the tech &amp; systems team</h3>
            <ServeForm team="Tech & Systems" />
          </div>
        </div>
      </section>

      <section aria-labelledby="dept-h" className="bg-surface-alt py-16 md:py-24">
        <div className="wrap">
          <p className="eyebrow mb-3">At your branch</p>
          <h2 id="dept-h" className="display mb-10 text-[clamp(31px,3.9vw,50px)]">
            Join a department
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {serveDepartments.map((d, i) => (
              <li key={d} className="reveal rounded-3xl border border-line bg-surface p-6" style={{ ["--d" as string]: `${i * 60}ms` }}>
                <p className="font-display text-[37px] font-semibold leading-none text-line-strong">0{i + 1}</p>
                <p className="mt-4 text-[20px] font-semibold">{d}</p>
                <p className="mt-2 text-[14px] text-muted">{deptBlurb[d]}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-3xl border border-line bg-surface p-6 md:p-10">
            <h3 className="display mb-6 text-[28px]">Tell us where you&apos;d like to serve</h3>
            <ServeForm />
          </div>
        </div>
      </section>
    </>
  );
}
