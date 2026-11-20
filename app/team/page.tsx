import { redirect } from "next/navigation";
import { RcnMark } from "@/components/layout/Brand";
import { authEnabled, getSession, previewLoginEnabled } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { LoginForm } from "./LoginForm";

export const metadata = pageMetadata({ title: "Team sign-in", description: "Private area for the RCN North America team.", path: "/team", noindex: true });

export default async function TeamLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/team/dashboard" } = await searchParams;
  if (await getSession()) redirect(next);
  const note = authEnabled
    ? "Accounts are by invitation only. Ask a network admin if you need access."
    : previewLoginEnabled
      ? "Preview sign-in: use the team preview password. No real documents are stored here yet."
      : "Sign-in isn't configured on this preview yet (needs Supabase).";
  return (
    <section className="on-night relative flex min-h-[100svh] items-center overflow-hidden bg-night py-32 text-on-night">
      <div aria-hidden className="absolute -left-40 top-20 h-[520px] w-[760px] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(closest-side,#df6526,transparent)" }} />
      <div className="wrap relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <RcnMark className="h-20 w-auto text-accent" />
          <p className="eyebrow mt-8">Team area</p>
          <h1 className="display mt-3 text-[clamp(37px,4.7vw,69px)]">For the RCN North America team.</h1>
          <p className="mt-5 max-w-md text-on-night-muted">Policies, guidelines, forms and brand assets for branch leaders and the internal team. Private and invite-only.</p>
        </div>
        <div className="rounded-3xl border border-on-night/15 bg-on-night/[0.04] p-7 md:p-10">
          <h2 className="display mb-6 text-[28px]">Sign in</h2>
          <LoginForm next={next} note={note} />
        </div>
      </div>
    </section>
  );
}
