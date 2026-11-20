"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapPoint = { slug: string; lat: number; lng: number; label: string; sub?: string };

/**
 * MapLibre GL with OpenFreeMap vector tiles (free, no API key, no account). Loaded only when
 * the map scrolls near the viewport so it never competes with the hero. Swap STYLE for a Mapbox
 * style + token if the ministry prefers the live site's Mapbox setup.
 */
const STYLE = "https://tiles.openfreemap.org/styles/positron";

export function MapView({
  points,
  selected,
  onSelect,
  origin,
  className = "",
  zoom,
  interactive = true,
}: {
  points: MapPoint[];
  selected?: string | null;
  onSelect?: (slug: string) => void;
  origin?: { lat: number; lng: number } | null;
  className?: string;
  zoom?: number;
  interactive?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const originMarker = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = el.current;
    const markerMap = markers.current;
    if (!node) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || map.current) return;
        io.disconnect();
        try {
          const ml = await import("maplibre-gl");
          if (cancelled) return;
          const m = new ml.Map({
            container: node,
            style: STYLE,
            center: points.length === 1 ? [points[0].lng, points[0].lat] : [-92, 39.5],
            zoom: zoom ?? (points.length === 1 ? 12.5 : 3.1),
            attributionControl: { compact: true },
            interactive,
            cooperativeGestures: true,
          });
          map.current = m;
          if (interactive) m.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
          m.on("load", () => {
            setReady(true);
            if (points.length > 1) {
              const b = new ml.LngLatBounds();
              points.forEach((p) => b.extend([p.lng, p.lat]));
              m.fitBounds(b, { padding: 60, duration: 0, maxZoom: 6 });
            }
          });
          m.on("error", () => {});
          points.forEach((p, i) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "rcn-marker";
            dot.style.setProperty("--d", `${i * 60}ms`);
            dot.setAttribute("aria-label", `${p.label}${p.sub ? `, ${p.sub}` : ""}`);
            dot.innerHTML = `<span class="rcn-marker-pulse"></span><span class="rcn-marker-dot"></span>`;
            dot.addEventListener("click", () => onSelect?.(p.slug));
            const mk = new ml.Marker({ element: dot }).setLngLat([p.lng, p.lat]).addTo(m);
            if (!onSelect) mk.setPopup(new ml.Popup({ offset: 16, closeButton: false }).setHTML(`<strong>${p.label}</strong>${p.sub ? `<br/>${p.sub}` : ""}`));
            markers.current.set(p.slug, mk);
          });
        } catch (err) {
          console.error(err);
          setFailed(true);
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(node);
    return () => {
      cancelled = true;
      io.disconnect();
      map.current?.remove();
      map.current = null;
      markerMap.clear();
    };
    // Points are static per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !map.current) return;
    markers.current.forEach((mk, slug) => mk.getElement().classList.toggle("is-selected", slug === selected));
    const p = points.find((x) => x.slug === selected);
    if (p) map.current.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.current.getZoom(), 7), duration: 900 });
  }, [selected, ready, points]);

  useEffect(() => {
    if (!ready || !map.current) return;
    (async () => {
      const ml = await import("maplibre-gl");
      originMarker.current?.remove();
      if (!origin) return;
      const me = document.createElement("div");
      me.className = "rcn-origin";
      originMarker.current = new ml.Marker({ element: me }).setLngLat([origin.lng, origin.lat]).addTo(map.current!);
    })();
  }, [origin, ready]);

  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative "}overflow-hidden bg-surface-alt ${className}`}>
      {/* Inline position: maplibre-gl.css sets .maplibregl-map { position: relative }, which would collapse it. */}
      <div ref={el} style={{ position: "absolute", inset: 0 }} />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-[14px] text-muted">
          {failed ? "The map couldn't load here. Use the address and directions links instead." : "Loading map…"}
        </div>
      )}
    </div>
  );
}
