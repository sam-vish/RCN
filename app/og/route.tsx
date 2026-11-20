import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Share image for every page (WhatsApp / Telegram / social previews): the page title over a
// frame from a real RCN gathering, with an optional branch line, e.g. /og?title=RCN%20Boston&sub=Littleton,%20MA

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Striving for the rebirth of Apostolic Christianity.").slice(0, 90);
  const sub = (searchParams.get("sub") || "").slice(0, 80);
  const imageName = ["hero", "boston", "orlando", "conference"].includes(searchParams.get("img") || "") ? searchParams.get("img")! : "hero";

  const root = process.cwd();
  const [serif, sans, photo] = await Promise.all([
    readFile(path.join(root, "assets/fonts/Sora-600.ttf")),
    readFile(path.join(root, "assets/fonts/SourceSans3-600.ttf")),
    readFile(path.join(root, `public/video/${imageName}-poster.jpg`)),
  ]);
  const bg = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#14110f" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bg} alt="" width={1200} height={675} style={{ position: "absolute", inset: 0, objectFit: "cover", opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(20,17,15,.96) 8%, rgba(20,17,15,.55) 55%, rgba(20,17,15,.15) 100%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "60px 72px", width: "100%" }}>
          <div style={{ fontFamily: "Source Sans 3", fontSize: 21, letterSpacing: 6, color: "#c8925f", textTransform: "uppercase" }}>
            Remnant Christian Network · North America
          </div>
          <div style={{ fontFamily: "Sora", fontSize: title.length > 40 ? 58 : 76, lineHeight: 1.05, letterSpacing: -2, color: "#f6f0e8", marginTop: 18, maxWidth: 980 }}>{title}</div>
          {sub && <div style={{ fontFamily: "Source Sans 3", fontSize: 28, color: "#d8cdbf", marginTop: 18 }}>{sub}</div>}
          <div style={{ marginTop: 30, width: 120, height: 5, background: "#df6526", borderRadius: 4 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Sora", data: serif, weight: 600, style: "normal" },
        { name: "Source Sans 3", data: sans, weight: 600, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    },
  );
}
