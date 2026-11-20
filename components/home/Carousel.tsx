"use client";

import { useRef, type ReactNode } from "react";

/** Horizontal scroll-snap row with prev/next buttons (touch and keyboard friendly). */
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const go = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div>
      <div className="mb-5 flex justify-end gap-2">
        {[-1, 1].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => go(d)}
            aria-label={d < 0 ? `Previous ${label}` : `Next ${label}`}
            className="grid h-11 w-11 place-items-center rounded-full border border-line-strong hover:border-ink"
          >
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${d < 0 ? "rotate-180" : ""}`} aria-hidden>
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        ))}
      </div>
      <ul ref={ref} aria-label={label} className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 md:gap-6">
        {children}
      </ul>
    </div>
  );
}
