"use client";

import { useEffect, useState } from "react";
import { branches } from "@/content/branches";
import type { Meeting } from "@/content/types";

type Schedules = Record<string, Meeting[]>;

const fallback: Schedules = Object.fromEntries(branches.map((b) => [b.slug, b.meetings]));
let cache: Schedules | null = null;
let inflight: Promise<Schedules> | null = null;

function load() {
  if (cache) return Promise.resolve(cache);
  inflight ??= fetch("/api/schedule")
    .then((r) => (r.ok ? (r.json() as Promise<Schedules>) : fallback))
    .catch(() => fallback)
    .then((s) => (cache = { ...fallback, ...s }));
  return inflight;
}

/** Live meeting times (leader edits included). Starts with the built-in data, then upgrades. */
export function useSchedules() {
  const [s, setS] = useState<Schedules>(cache ?? fallback);
  useEffect(() => {
    let alive = true;
    load().then((x) => alive && setS(x));
    return () => {
      alive = false;
    };
  }, []);
  return s;
}

/** A branch with its live meetings swapped in. */
export function useLiveBranch(slug: string) {
  const s = useSchedules();
  const b = branches.find((x) => x.slug === slug);
  return b ? { ...b, meetings: s[slug] ?? b.meetings } : undefined;
}
