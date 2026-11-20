"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Sticky in-page nav for the branch "mini site": highlights the section in view. */
export function BranchNav({ items, name, visitHref }: { items: { id: string; label: string }[]; name: string; visitHref: string }) {
  const [active, setActive] = useState<string | undefined>(undefined);
  useEffect(() => {
    // The active section is the last one whose top has passed 40% of the viewport.
    let raf = 0;
    const update = () => {
      const line = window.innerHeight * 0.4;
      let current: string | undefined;
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top <= line) current = i.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label={`${name} sections`} className="sticky top-[72px] z-30 border-b border-line bg-bg/90 backdrop-blur-md md:top-20">
      <div className="wrap flex items-center gap-4">
        <ul className="no-scrollbar flex flex-1 gap-1 overflow-x-auto py-2.5 text-[14px] font-semibold">
          {items.map((i) => (
            <li key={i.id} className="shrink-0">
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? "true" : undefined}
                className={`block rounded-full px-3.5 py-1.5 transition-colors ${active === i.id ? "bg-ink text-on-night" : "text-ink/75 hover:bg-ink/5 hover:text-ink"}`}
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
        <Link href={visitHref} className="hidden shrink-0 rounded-full bg-branch px-4 py-2 text-[14px] font-semibold text-white hover:brightness-110 md:inline-block">
          Plan a visit
        </Link>
      </div>
    </nav>
  );
}
