"use client";

import { useCallback, useMemo, useState } from "react";
import { branches, distanceKm } from "@/content/branches";
import type { Branch } from "@/content/types";

export type Origin = { lat: number; lng: number; label: string };
export type Ranked = { branch: Branch; km?: number };

const REGION_NAMES: Record<string, string> = {
  MN: "minnesota", CA: "california", NY: "new york", TX: "texas", FL: "florida", OK: "oklahoma",
  MA: "massachusetts", DE: "delaware", PA: "pennsylvania", MD: "maryland virginia washington dc dmv",
};

function haystack(b: Branch) {
  return `${b.name} ${b.shortName} ${b.city} ${b.region} ${REGION_NAMES[b.region] ?? ""} ${b.country} ${b.address}`.toLowerCase();
}

/** Text match first (instant, offline); ZIP/other places go through /api/geocode, then rank by distance. */
export function useBranchSearch() {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "searching" | "error">("idle");
  const [message, setMessage] = useState("");

  const results: Ranked[] = useMemo(() => {
    if (origin) {
      return branches
        .map((b) => ({ branch: b, km: distanceKm(origin, b) }))
        .sort((a, b) => a.km - b.km);
    }
    const q = query.trim().toLowerCase();
    const list = q && !/^\d/.test(q) ? branches.filter((b) => q.split(/[\s,]+/).every((w) => haystack(b).includes(w))) : branches;
    return list.map((b) => ({ branch: b }));
  }, [query, origin]);

  const search = useCallback(async (q: string) => {
    const term = q.trim();
    if (!term) return;
    const direct = branches.filter((b) => term.toLowerCase().split(/[\s,]+/).every((w) => haystack(b).includes(w)));
    if (direct.length && !/^\d/.test(term)) {
      setOrigin(null);
      return;
    }
    setStatus("searching");
    setMessage("");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(term)}`);
      const data = (await res.json()) as Partial<Origin> & { error?: string };
      if (!res.ok || data.lat == null || data.lng == null) throw new Error(data.error || "not found");
      setOrigin({ lat: data.lat, lng: data.lng, label: data.label || term });
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage(`We couldn't find "${term}". Try a city and state, or a US/Canadian ZIP or postal code.`);
    }
  }, []);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setMessage("Your browser doesn't share location. Search by city or ZIP instead.");
      return;
    }
    setStatus("locating");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude, label: "your location" });
        setQuery("");
        setStatus("idle");
      },
      () => {
        setStatus("error");
        setMessage("Location is turned off. Search by city or ZIP instead.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }, []);

  const reset = useCallback(() => {
    setOrigin(null);
    setQuery("");
    setStatus("idle");
    setMessage("");
  }, []);

  return { query, setQuery: (q: string) => { setQuery(q); setOrigin(null); }, origin, results, status, message, search, locate, reset };
}

export function formatDistance(km?: number) {
  if (km == null) return "";
  const mi = km * 0.621371;
  return mi < 1 ? "under 1 mi" : `${Math.round(mi).toLocaleString()} mi`;
}
