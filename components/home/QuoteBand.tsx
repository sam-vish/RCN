import Image from "next/image";
import { LoopVideo } from "@/components/motion/LoopVideo";
import { leadPastorQuote, networkLeaders } from "@/content/words";

/**
 * The Lead Pastor's quote. Light and warm (the network's room, not the AAO site's dark one):
 * ink on sand, with the worship footage in its own framed panel instead of behind the text.
 */
export function QuoteBand({ eyebrow = "Teaching at RCN North America" }: { eyebrow?: string }) {
  return (
    <section aria-label="From our Lead Pastor" className="relative overflow-hidden bg-surface-alt py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/2 h-[520px] w-[620px] -translate-y-1/2 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(closest-side,#df6526,transparent)" }} />
      <div className="wrap relative grid items-center gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <figure>
          <p className="eyebrow mb-6">{eyebrow}</p>
          <span aria-hidden className="display block text-[94px] leading-[0.55] text-accent">“</span>
          <blockquote className="display reveal text-[clamp(23px,3vw,44px)] leading-[1.08] text-ink">{leadPastorQuote.text}</blockquote>
          <figcaption className="mt-10 flex items-center gap-4">
            <span className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-surface">
              <Image src={networkLeaders[1].photo} alt="" fill sizes="56px" className="object-cover object-top" />
            </span>
            <span>
              <span className="block font-semibold">{leadPastorQuote.name}</span>
              <span className="block text-[14px] text-muted">{leadPastorQuote.role}</span>
            </span>
          </figcaption>
        </figure>
        <div className="reveal relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgba(23,20,18,0.55)] sm:aspect-[16/11] lg:aspect-[4/5]" style={{ ["--d" as string]: "120ms" }}>
          <LoopVideo name="worship" className="absolute inset-0" objectPosition="45% 40%" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/45 via-transparent to-transparent" />
          <p className="absolute bottom-4 left-5 text-[12px] font-semibold text-on-night/90">Worship at Marching Orders 2026</p>
        </div>
      </div>
    </section>
  );
}
