import "server-only";

// Live data: public channel/playlist RSS feeds (no API key), cached for 30 minutes (ISR).
// The full library comes from content/sermons.snapshot.json (scraped from the live site's
// 1,000-message library + branch channels); RSS adds anything newer without a redeploy.

export type FeedVideo = { id: string; title: string; published: string; channelId?: string };

const REVALIDATE = 1800;

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pick(block: string, re: RegExp) {
  const m = block.match(re);
  return m ? decode(m[1].trim()) : "";
}

async function fetchFeed(query: string): Promise<FeedVideo[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?${query}`, {
      next: { revalidate: REVALIDATE, tags: ["youtube"] },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return xml
      .split("<entry>")
      .slice(1)
      .map((e) => ({
        id: pick(e, /<yt:videoId>([^<]+)<\/yt:videoId>/),
        title: pick(e, /<title>([\s\S]*?)<\/title>/),
        published: pick(e, /<published>([^<]+)<\/published>/),
        channelId: pick(e, /<yt:channelId>([^<]+)<\/yt:channelId>/),
      }))
      .filter((v) => v.id);
  } catch {
    return [];
  }
}

export const channelFeed = (channelId: string) => fetchFeed(`channel_id=${channelId}`);
export const playlistFeed = (playlistId: string) => fetchFeed(`playlist_id=${playlistId}`);

export function thumb(id: string, quality: "hq" | "mq" | "maxres" = "hq") {
  return `https://i.ytimg.com/vi/${id}/${quality === "maxres" ? "maxresdefault" : `${quality}default`}.jpg`;
}
