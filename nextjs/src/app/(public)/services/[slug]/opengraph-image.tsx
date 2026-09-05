import { SERVICES, SERVICE_BY_SLUG, isServiceSlug } from "@/content/services";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";

/**
 * The social card for one service.
 *
 * The headline on it is the page's own `h1`, which is a claim rather than the service's name,
 * so a link to the web development page pasted into a chat says what that page argues instead
 * of saying "Web Development". The name goes in the eyebrow, where it labels the card.
 *
 * `generateStaticParams` is declared here as well as on the page. A metadata route is its own
 * route and is generated on demand without one, which is a rendered image on the first share
 * of a page that has been the same since the build. The services are a fixed list in the
 * repository, so there is no reason to draw four cards at request time.
 *
 * A slug that is not a service still has to return an image rather than throw, because a
 * crawler asks for the card independently of the page, and the page it belongs to is a 404.
 */

export const alt = "Bitnox Technology Solutions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export default async function ServiceOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = isServiceSlug(slug) ? SERVICE_BY_SLUG[slug] : undefined;

  return renderOgCard({
    eyebrow: service?.name ?? "Services",
    title: service?.hero.headline ?? "Bitnox Technology Solutions",
    meta: service?.tagline,
  });
}
