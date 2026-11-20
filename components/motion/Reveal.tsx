"use client";

import { useEffect } from "react";

/**
 * One observer for the whole page: anything with `.reveal` fades up once it scrolls into view;
 * `.map-reveal` gets `.map-in` (map pins + arcs). Also drives the hero parallax variable.
 * Hidden states only apply under `.js` (set inline in <head>), so no-JS visitors see everything.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add(e.target.classList.contains("map-reveal") ? "map-in" : "in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll(".reveal:not(.in), .map-reveal:not(.map-in)").forEach((el) => io.observe(el));
    scan();
    // Pages swap on client navigation; pick up new elements.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => document.documentElement.style.setProperty("--sy", String(Math.min(window.scrollY, 1200))));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
