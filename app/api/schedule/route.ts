import { NextResponse } from "next/server";
import { getAllBranches } from "@/lib/branch-content";

// Meeting times for every branch, with leader edits from /admin applied. Client widgets
// (countdowns, the "this week" ticker, the branch finder) read this so an edit shows up
// site-wide, falling back to the built-in data if it can't be reached.
export const revalidate = 120;

export async function GET() {
  const all = await getAllBranches();
  return NextResponse.json(Object.fromEntries(all.map((b) => [b.slug, b.meetings])), {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
  });
}
