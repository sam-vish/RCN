"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { moreNav, primaryNav } from "@/content/site";
import { RcnLogo } from "./Brand";
import { Icon } from "@/components/ui";
import { BranchFinder } from "@/components/map/BranchFinder";

/** Routes whose header sits over dark footage. */
function overDark(path: string) {
  if (path === "/") return true;
  if (/^\/branches\/[^/]+$/.test(path)) return true;
  return ["/events", "/about-us", "/serve", "/team"].includes(path) || path.startsWith("/events/");
}

export function Header() {
  const path = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const finder = useRef<HTMLDialogElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  // Close menus on navigation (state reset during render, the React-recommended pattern).
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setMenu(false);
    setMore(false);
  }
  useEffect(() => {
    finder.current?.close();
  }, [path]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);
  useEffect(() => {
    if (!more) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !moreRef.current?.contains(e.target as Node)) setMore(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [more]);

  const dark = overDark(path) && !scrolled && !menu;
  const team = path.startsWith("/team") || path.startsWith("/admin");
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
          dark ? "on-night text-on-night" : "bg-bg/90 text-ink shadow-[0_1px_0_var(--line)] backdrop-blur-md"
        }`}
      >
        {dark && <div aria-hidden className="pointer-events-none absolute inset-0 -bottom-10 bg-gradient-to-b from-night/70 to-transparent" />}
        <div className="wrap relative flex h-[72px] items-center justify-between gap-6 md:h-20">
          <Link href="/" className="shrink-0">
            <RcnLogo tone={dark ? "night" : "ink"} />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 text-[15px] font-semibold">
              {primaryNav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`relative rounded-full px-3.5 py-2 transition-colors ${dark ? "hover:bg-on-night/10" : "hover:bg-ink/5"} ${
                      isActive(n.href) ? "after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-accent" : ""
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li ref={moreRef} className="relative">
                <button
                  type="button"
                  aria-expanded={more}
                  aria-haspopup="true"
                  onClick={() => setMore((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 ${dark ? "hover:bg-on-night/10" : "hover:bg-ink/5"}`}
                >
                  More
                  <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} aria-hidden>
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                {more && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-line bg-surface p-2 text-ink shadow-[0_24px_60px_-20px_rgba(23,20,18,0.35)]">
                    {moreNav.map((n) => {
                      const ext = n.href.startsWith("http");
                      const C = ext ? "a" : Link;
                      return (
                        <C
                          key={n.href}
                          href={n.href}
                          {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="block rounded-xl px-4 py-3 hover:bg-surface-alt"
                        >
                          <span className="block text-[15px] font-semibold">
                            {n.label}
                            {ext && <span className="sr-only"> (opens aaobooks.com)</span>}
                          </span>
                          <span className="block text-[13px] font-medium text-muted">{n.blurb}</span>
                        </C>
                      );
                    })}
                  </div>
                )}
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {!team && (
              <button
                type="button"
                onClick={() => finder.current?.showModal()}
                className={`hidden h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold md:inline-flex ${
                  dark ? "border-on-night/30 hover:bg-on-night/10" : "border-line-strong hover:border-ink"
                }`}
              >
                <Icon name="search" className="h-4 w-4" />
                Find your branch
              </button>
            )}
            <Link href="/giving" className="btn-accent inline-flex h-11 items-center rounded-full px-5 text-[15px] font-semibold">
              Give
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu((v) => !v)}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                {menu ? (
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div id="mobile-menu" className="fixed inset-0 z-40 overflow-y-auto bg-bg pt-24 lg:hidden">
          <nav aria-label="Mobile" className="wrap pb-32">
            <ul className="divide-y divide-line border-y border-line">
              {[...primaryNav, ...moreNav].map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="flex items-center justify-between py-4 font-display text-[27px] font-semibold leading-none">
                    {n.label}
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent" aria-hidden>
                      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Sticky "Find a branch" pill on phones (PRD §5). */}
      {!team && !path.startsWith("/locations") && (
        <button
          type="button"
          onClick={() => {
            setMenu(false);
            finder.current?.showModal();
          }}
          className="fixed bottom-4 left-1/2 z-40 inline-flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold text-on-night shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] md:hidden"
        >
          <Icon name="pin" className="h-4 w-4 text-accent" />
          Find a branch
        </button>
      )}

      <dialog
        ref={finder}
        aria-label="Find your branch"
        onClick={(e) => {
          if (e.target === finder.current) finder.current?.close();
        }}
        className="m-auto mt-[10vh] w-[min(640px,calc(100vw-24px))] rounded-3xl bg-bg p-0 text-ink backdrop:bg-night/60 backdrop:backdrop-blur-sm"
      >
        <div className="p-5 md:p-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="display text-3xl">Find your branch</p>
            <button
              type="button"
              onClick={() => finder.current?.close()}
              aria-label="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-line-strong hover:border-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <BranchFinder compact />
        </div>
      </dialog>
    </>
  );
}
