import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pb-20 pt-36">
      <div className="wrap max-w-3xl">
        <p className="eyebrow mb-4">Page not found</p>
        <h1 className="display text-[clamp(37px,5.5vw,75px)]">This page wandered off.</h1>
        <p className="mt-5 text-lg text-muted">The link may be old. Here are the places people usually look for:</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/locations">Find a branch</ButtonLink>
          <ButtonLink href="/sermons" variant="ghost">Sermons</ButtonLink>
          <ButtonLink href="/" variant="ghost">Home</ButtonLink>
        </div>
      </div>
    </section>
  );
}
