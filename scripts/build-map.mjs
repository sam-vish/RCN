// Builds content/na-map.json: a projected outline of the US + Canada (+ Mexico for context) and
// the projected position of every branch, for the home-page "network" map. No tiles, no API key.
// Run: npm run map:build   (re-run after adding a branch)
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoConicConformal, geoPath } from "d3-geo";

const W = 1000, H = 640;
const world = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url)));
const countries = feature(world, world.objects.countries).features;
const pick = (ids) => countries.filter((f) => ids.includes(f.id));
const na = pick(["840", "124"]); // USA, Canada
const ctx = pick(["484"]); // Mexico (context only)

// Clip to the contiguous US + southern Canada so Alaska/the Arctic don't shrink the map.
const box = { type: "Polygon", coordinates: [[[-126, 24], [-126, 53], [-64, 53], [-64, 24], [-126, 24]]] };
const projection = geoConicConformal().parallels([33, 45]).rotate([96, 0]).fitExtent([[10, 10], [W - 10, H - 10]], box);
projection.clipExtent([[0, 0], [W, H]]);
const path = geoPath(projection).digits(0);
const clip = (f) => path(f);

const src = readFileSync(new URL("../content/branches.data.ts", import.meta.url), "utf8");
const pts = src
  .split("\n")
  .filter((l) => l.trim().startsWith('{"slug"'))
  .map((l) => JSON.parse(l.trim().replace(/,$/, "")))
  .map((b) => {
    const [x, y] = projection([b.lng, b.lat]);
    return { slug: b.slug, x: +x.toFixed(1), y: +y.toFixed(1) };
  });

// Only the branch points ship in JS/HTML. The dotted landmass is a static image, rasterised
// once by the browser instead of repainting a 50 KB path on every animation frame.
writeFileSync(new URL("../content/na-map.json", import.meta.url), JSON.stringify({ width: W, height: H, points: pts }));
const land = na.map(clip).join("");
const context = ctx.map(clip).join("");
for (const [name, dot, edge] of [
  ["night", "rgba(246,240,232,0.22)", "rgba(246,240,232,0.14)"],
  ["light", "rgba(23,20,18,0.18)", "rgba(23,20,18,0.14)"],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs><pattern id="d" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="${dot}"/></pattern><path id="l" d="${land}"/></defs><path d="${context}" fill="url(#d)" opacity="0.45"/><use href="#l" fill="url(#d)"/><use href="#l" fill="none" stroke="${edge}" stroke-width="0.8"/></svg>`;
  writeFileSync(new URL(`../public/images/map/na-${name}.svg`, import.meta.url), svg);
}
console.log("na-map.json", pts.length, "points");
