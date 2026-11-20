"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Muted, looping footage that behaves: the poster paints first (and is the LCP image),
 * the video fades in once it is actually playing, it only plays while on screen, and it
 * never loads at all for reduced-motion or data-saver visitors.
 * Files live in /public/video/<name>.{webm,mp4} + <name>-poster.jpg (see scripts in README).
 */
type Props = {
  name: string;
  /** Portrait variant for phones (<768px), e.g. "hero-mobile". */
  mobileName?: string;
  className?: string;
  /** Hero: load immediately and prioritise the poster. */
  priority?: boolean;
  objectPosition?: string;
  onTime?: (t: number) => void;
  children?: ReactNode;
};

export function LoopVideo({ name, mobileName, className = "relative", priority, objectPosition = "50% 50%", onTime, children }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    const el = wrap.current;
    if (!v || !el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced || conn?.saveData) return;

    const useMobile = mobileName && window.matchMedia("(max-width: 767px)").matches;
    const base = `/video/${useMobile ? mobileName : name}`;
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      const webm = document.createElement("source");
      webm.src = `${base}.webm`;
      webm.type = "video/webm";
      const mp4 = document.createElement("source");
      mp4.src = `${base}.mp4`;
      mp4.type = "video/mp4";
      v.append(webm, mp4);
      v.load();
    };

    // The hero waits until the page has finished loading (plus a beat) so the video never
    // competes with the first paint; everything else loads when it scrolls near view.
    let ready = !priority || document.readyState === "complete";
    let pendingPlay = false;
    const onLoad = () =>
      setTimeout(() => {
        ready = true;
        if (pendingPlay) {
          load();
          v.play().catch(() => {});
        }
      }, 600);
    if (!ready) window.addEventListener("load", onLoad, { once: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!ready) {
            pendingPlay = true;
            return;
          }
          load();
          v.play().catch(() => {});
        } else {
          pendingPlay = false;
          v.pause();
        }
      },
      { rootMargin: priority ? "0px" : "200px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, [name, mobileName, priority]);

  const poster = `/video/${name}-poster.jpg`;
  return (
    <div ref={wrap} className={`overflow-hidden ${className}`}>
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileName ? `/video/${mobileName}-poster.jpg` : `/video/${name}-poster-sm.jpg`} />
        <img
          src={poster}
          alt=""
          aria-hidden
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition }}
        />
      </picture>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        onPlaying={() => {
          setPlaying(true);
          // Lets below-the-fold assets wait until the hero no longer needs the bandwidth.
          if (priority) window.dispatchEvent(new Event("rcn:hero-playing"));
        }}
        onTimeUpdate={onTime ? (e) => onTime(e.currentTarget.currentTime) : undefined}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
        style={{ objectPosition }}
      />
      {children}
    </div>
  );
}
