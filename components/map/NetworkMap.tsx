import Link from "next/link";
import map from "@/content/na-map.json";
import { branches } from "@/content/branches";

/**
 * The "network" motif (PRD §7): North America with a glowing point per branch, arcs drawn out
 * from headquarters in Minnesota. Server-rendered SVG (no map library, no tiles); pins are real
 * links to each branch page. Animation is CSS, triggered when the map scrolls into view.
 */
export function NetworkMap({ tone = "night", className = "", labels = true }: { tone?: "night" | "light"; className?: string; labels?: boolean }) {
  const pts = map.points as { slug: string; x: number; y: number }[];
  const hq = pts.find((p) => p.slug === "minnesota")!;
  const night = tone === "night";
  // Labels for close neighbours would collide: nudge them.
  const labelOffset: Record<string, [number, number, "start" | "end"]> = {
    boston: [12, -6, "start"],
    "new-york": [12, 4, "start"],
    philadelphia: [-12, -6, "end"],
    delaware: [12, 12, "start"],
    "maryland-dmv": [-12, 12, "end"],
    canada: [-10, -10, "end"],
    tulsa: [12, -4, "start"],
    "oklahoma-city": [-12, 2, "end"],
    "dallas-texas": [-12, 4, "end"],
    "houston-texas": [12, 10, "start"],
  };
  return (
    <div className={`relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/images/map/na-${night ? "night" : "light"}.svg`} alt="" aria-hidden width={map.width} height={map.height} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full" />
    <svg viewBox={`0 0 ${map.width} ${map.height}`} className="map-reveal relative h-auto w-full" role="group" aria-label="Map of RCN branches across North America">
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffb17a" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#df6526" stopOpacity="0.45" />
          <stop offset="1" stopColor="#df6526" stopOpacity="0" />
        </radialGradient>
      </defs>

      {pts
        .filter((p) => p !== hq)
        .map((p, i) => {
          const mx = (hq.x + p.x) / 2;
          const my = Math.min(hq.y, p.y) - Math.abs(hq.x - p.x) * 0.22 - 20;
          const len = Math.round(Math.hypot(p.x - hq.x, p.y - hq.y) * 1.3);
          return (
            <path
              key={p.slug}
              className="arc"
              d={`M${hq.x},${hq.y} Q${mx},${my} ${p.x},${p.y}`}
              fill="none"
              stroke="#df6526"
              strokeOpacity={night ? 0.55 : 0.45}
              strokeWidth="1.2"
              style={{ ["--len" as string]: len, ["--d" as string]: `${200 + i * 90}ms` }}
            />
          );
        })}

      {pts.map((p, i) => {
        const b = branches.find((x) => x.slug === p.slug)!;
        const [dx, dy, anchor] = labelOffset[p.slug] ?? [12, 4, "start"];
        const isHq = p.slug === "minnesota";
        return (
          <Link key={p.slug} href={`/branches/${p.slug}`} aria-label={`${b.shortName}, ${b.city}, ${b.region}`} className="group outline-none">
            <g className="map-pin" style={{ ["--d" as string]: `${i * 70}ms` }}>
              <circle cx={p.x} cy={p.y} r="22" fill="url(#glow)" opacity="0.65" />
              <circle cx={p.x} cy={p.y} r="5" fill="#df6526" className="pin-pulse" style={{ ["--d" as string]: `${(i % 5) * 450}ms` }} />
              <circle cx={p.x} cy={p.y} r={isHq ? 6.5 : 4.5} fill={isHq ? "#ffd2b0" : "#ff9a5c"} stroke={night ? "#14110f" : "#faf7f2"} strokeWidth="1.5" className="transition-[r] duration-200 group-hover:[r:8] group-focus-visible:[r:8]" />
              {labels && (
                <text
                  x={p.x + dx}
                  y={p.y + dy}
                  textAnchor={anchor}
                  className={`pointer-events-none font-sans text-[13px] font-semibold transition-opacity ${night ? "fill-on-night" : "fill-ink"} opacity-80 group-hover:opacity-100`}
                >
                  {b.name.replace(", Texas", "").replace(", Florida", "")}
                  {isHq ? " · HQ" : ""}
                </text>
              )}
            </g>
          </Link>
        );
      })}
    </svg>
    </div>
  );
}
