"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/** Grid + full-screen lightbox (keyboard: ←/→/Esc). */
export function Lightbox({ items }: { items: { src: string; alt: string }[] }) {
  const [i, setI] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const go = useCallback((d: number) => setI((x) => (x == null ? x : (x + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (i != null && !dialog.current?.open) dialog.current?.showModal();
  }, [i]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (i == null) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [i, go]);

  return (
    <>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {items.map((x, n) => (
          <li key={x.src}>
            <button type="button" onClick={() => setI(n)} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-alt" aria-label={`Open photo: ${x.alt}`}>
              <Image src={x.src} alt={x.alt} fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        onClose={() => setI(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-label="Photo viewer"
        className="m-0 h-full max-h-none w-full max-w-none bg-night/95 p-0 text-on-night backdrop:bg-night/80"
      >
        {i != null && (
          <div className="relative flex h-full items-center justify-center p-4 md:p-12">
            <div className="relative h-full w-full">
              <Image src={items[i].src} alt={items[i].alt} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[14px] text-on-night/80">
              {items[i].alt} · {i + 1}/{items.length}
            </p>
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(d)}
                aria-label={d < 0 ? "Previous photo" : "Next photo"}
                className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-on-night/30 hover:bg-on-night/10 ${d < 0 ? "left-4" : "right-4"}`}
              >
                <svg viewBox="0 0 24 24" className={`h-5 w-5 ${d < 0 ? "rotate-180" : ""}`} aria-hidden>
                  <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            ))}
            <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close" className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full border border-on-night/30 hover:bg-on-night/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
