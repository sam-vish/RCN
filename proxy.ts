import { NextResponse, type NextRequest } from "next/server";

// Gate the private areas (PRD §6.12/6.13): anything under /team/* or /admin requires a session
// cookie; the pages then verify the token with Supabase. /team itself is the sign-in screen.
// Private routes are always noindex.

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("rcn-at") || req.cookies.has("rcn-preview");
  const isLogin = pathname === "/team";
  if (!isLogin && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/team";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/team", "/team/:path+", "/admin", "/admin/:path*"],
};
