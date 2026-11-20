import { NextResponse } from "next/server";

// City/ZIP → lat/lng for the branch finder. US ZIPs and Canadian postal codes go to Zippopotam
// (free, no key); anything else to Photon (OpenStreetMap), limited to the US and Canada.
// Responses are cached for a day; only the search text is sent, never anything about the visitor.

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 80);
  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });
  const cache = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };
  try {
    const zip = q.match(/^(\d{5})(?:-\d{4})?$/);
    const postal = q.toUpperCase().match(/^([A-Z]\d[A-Z])\s?\d[A-Z]\d$|^([A-Z]\d[A-Z])$/);
    if (zip || postal) {
      const url = zip ? `https://api.zippopotam.us/us/${zip[1]}` : `https://api.zippopotam.us/ca/${postal![1] ?? postal![2]}`;
      const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const d = (await res.json()) as { places?: { "place name": string; latitude: string; longitude: string; "state abbreviation"?: string }[] };
        const p = d.places?.[0];
        if (p) return NextResponse.json({ lat: +p.latitude, lng: +p.longitude, label: `${p["place name"]}${p["state abbreviation"] ? `, ${p["state abbreviation"]}` : ""}` }, { headers: cache });
      }
    }
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en&layer=city&layer=county&layer=state&layer=postcode`, {
      headers: { "User-Agent": "rcnnorthamerica.com branch finder" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const d = (await res.json()) as { features?: { geometry: { coordinates: [number, number] }; properties: { name?: string; state?: string; countrycode?: string } }[] };
      const f = d.features?.find((x) => ["US", "CA"].includes(x.properties.countrycode ?? ""));
      if (f) {
        const [lng, lat] = f.geometry.coordinates;
        return NextResponse.json({ lat, lng, label: [f.properties.name, f.properties.state].filter(Boolean).join(", ") }, { headers: cache });
      }
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
