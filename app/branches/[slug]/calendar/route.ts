import { getBranch } from "@/content/branches";
import { SITE_URL } from "@/content/site";
import { meetingIcs } from "@/lib/schedule";
import { getBranchContent, withContent } from "@/lib/branch-content";

// .ics download for one meeting time: /branches/boston/calendar?m=0 (recurring where the rule allows).
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const base = getBranch(slug);
  const b = base && withContent(base, await getBranchContent(slug));
  const i = Number(new URL(req.url).searchParams.get("m"));
  const m = b?.meetings[i];
  if (!b || !m) return new Response("Not found", { status: 404 });
  const ics = meetingIcs(m, b, SITE_URL);
  if (!ics) return new Response("This gathering has no fixed schedule yet.", { status: 404 });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${b.slug}-${m.title.replace(/\W+/g, "-").toLowerCase()}.ics"`,
    },
  });
}
