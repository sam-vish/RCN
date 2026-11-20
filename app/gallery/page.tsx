import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { getAlbums } from "@/lib/published";
import { pageMetadata } from "@/lib/seo";
import { Lightbox } from "@/components/motion/Lightbox";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Gallery | Moments from Our Gatherings",
  description: "Recap photos and video from RCN North America conferences and national events, curated by our media team.",
  path: "/gallery",
  ogTitle: "Moments from our gatherings",
});

export default async function GalleryPage() {
  const albums = await getAlbums();
  return (
    <>
      <PageHeader kicker="Gallery" title="Moments from our gatherings." intro="Recap photos and video from RCN North America conferences and national events, curated by our media team." />
      <section className="py-14 md:py-20">
        <div className="wrap">
          {albums.length ? (
            <div className="space-y-16">
              {albums.map((a) => (
                <article key={a.id}>
                  <h2 className="display text-[31px]">{a.title}</h2>
                  {a.event_date && <p className="text-muted">{new Date(a.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
                  <Lightbox items={a.items.map((x) => ({ src: x.url, alt: x.alt ?? a.title }))} />
                </article>
              ))}
            </div>
          ) : (
            <>
              <EmptyState icon="photo" title="New galleries coming soon" body="Our media team is preparing recaps from recent RCN gatherings. Photos and video will appear here as they are published.">
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/events">See upcoming events</ButtonLink>
                  <ButtonLink href="/locations" variant="ghost">
                    Find a gathering
                  </ButtonLink>
                </div>
              </EmptyState>
              <div className="mt-10">
                <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-muted">Already on the site</p>
                <Lightbox
                  items={[
                    { src: "/images/gatherings/congregation-worship-night.jpg", alt: "Congregation in worship at an RCN gathering" },
                    { src: "/images/gatherings/apostolic-prayer-ministry.jpg", alt: "Prayer ministry at the Partners Conference" },
                    { src: "/images/gatherings/worship-team-stage-ministry.jpg", alt: "Worship team ministering" },
                    { src: "/images/gatherings/partners-conference-celebration.jpg", alt: "Celebration at the Partners Conference" },
                    { src: "/images/gatherings/congregation-listening-moment.jpg", alt: "Congregation listening to the Word" },
                  ]}
                />
                <p className="mt-3 text-[12px] text-muted">These five photos are from the current rcnnorthamerica.com.</p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

