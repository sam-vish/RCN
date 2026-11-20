import Image from "next/image";
import { PlayTrigger } from "@/components/motion/VideoModal";
import { Icon } from "@/components/ui";

export type CardSermon = { id: string; title: string; speaker?: string; date?: string; duration?: string; tag?: string };

/** Message card: thumbnail, duration, title, speaker, date. Opens the modal player (facade, no iframe until clicked). */
export function SermonCard({ s, tone = "light", priority }: { s: CardSermon; tone?: "light" | "night"; priority?: boolean }) {
  const night = tone === "night";
  return (
    <PlayTrigger id={s.id} title={s.title} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-night">
        <Image
          src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          priority={priority}
          quality={60}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
        <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full bg-on-night/90 text-night opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Icon name="play" className="ml-0.5 h-6 w-6" />
        </span>
        {s.duration && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-night/85 px-2 py-0.5 text-[12px] font-semibold tabular-nums text-on-night">{s.duration}</span>
        )}
        {s.tag && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-on-night/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-night">{s.tag}</span>
        )}
      </div>
      <p className={`mt-3.5 line-clamp-2 text-[17px] font-semibold leading-snug ${night ? "text-on-night group-hover:text-gold" : "group-hover:text-accent-ink"}`}>{s.title}</p>
      {(s.speaker || s.date) && (
        <p className={`mt-1 text-[14px] ${night ? "text-on-night-muted" : "text-muted"}`}>
          {s.speaker}
          {s.speaker && s.date ? " · " : ""}
          {s.date}
        </p>
      )}
    </PlayTrigger>
  );
}
