import type { MetadataRoute } from "next";

import { SERVICES, servicePath } from "@/content/services";
import { LEGAL_LAST_UPDATED_ISO } from "@/content/legal";
import { getPublishedPostIndex, getPublishedTags } from "@/lib/queries/blog";
import { getPublishedProjectIndex } from "@/lib/queries/portfolio";
import { absoluteUrl } from "@/lib/urls";

/**
 * The sitemap.
 *
 * Every indexable URL on the site and nothing else. The admin, the API routes, the blog
 * preview and the one-click unsubscribe page are all left out: the first two because they are
 * private, the third because it renders a draft, and the fourth because it is `noindex` and
 * is only ever reached from a link in an email. `/cleaning` is in, even though it canonicals
 * to the subdomain, because it exists to catch visitors who land on the main domain and a
 * canonical is what decides which of the two ranks.
 *
 * `lastModified` is the only field emitted. `changefreq` and `priority` are in the sitemap
 * format and are read by nobody: Google has said for years that it ignores both, and a
 * priority column where every page is between 0.5 and 1.0 tells a crawler nothing it could
 * not work out from the link structure. Emitting them would mean inventing a number per page
 * and then maintaining it, which is the same trade this codebase refuses everywhere else.
 *
 * The dates that matter are real ones. Posts and projects carry their own `updatedAt`, the
 * two indexes carry the date of the most recent thing on them, and the legal pages carry the
 * date written at the top of the document. `PAGES_LAST_MODIFIED` covers the marketing pages,
 * whose content lives in the repository rather than in the database, and it is a constant
 * that is edited by hand when that copy changes. A build date would be worse than useless
 * here: it would tell a crawler that every page on the site changed every time anything was
 * deployed, which is how a sitemap teaches a crawler to stop reading its own dates.
 *
 * Nothing here reads the clock, for the reason the whole caching strategy exists. The reads
 * are the same cached queries the pages use, so this costs no extra database work and is
 * invalidated by the same tags: publishing a post updates the post's page and its line in the
 * sitemap in one `revalidateTag` call.
 */

/**
 * When the copy on the hand-written pages last changed.
 *
 * Update this when the home page, the services, the Event Space or the about and contact
 * pages are rewritten. It is not the deployment date and it is not today.
 */
const PAGES_LAST_MODIFIED = new Date("2026-09-05T00:00:00.000Z");

const LEGAL_LAST_MODIFIED = new Date(`${LEGAL_LAST_UPDATED_ISO}T00:00:00.000Z`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects, tags] = await Promise.all([
    getPublishedPostIndex(),
    getPublishedProjectIndex(),
    getPublishedTags(),
  ]);

  // The index pages change when the newest thing on them changes, and not otherwise. With an
  // empty database they fall back to the date the page itself was written.
  const newestPost = latest(
    posts.map((post) => post.updatedAt),
    PAGES_LAST_MODIFIED,
  );
  const newestProject = latest(
    projects.map((project) => project.updatedAt),
    PAGES_LAST_MODIFIED,
  );

  return [
    entry("/", PAGES_LAST_MODIFIED),
    entry("/services", PAGES_LAST_MODIFIED),
    ...SERVICES.map((service) => entry(servicePath(service.slug), PAGES_LAST_MODIFIED)),
    entry("/event-space", PAGES_LAST_MODIFIED),
    entry("/portfolio", newestProject),
    ...projects.map((project) => entry(`/portfolio/${project.slug}`, new Date(project.updatedAt))),
    entry("/blog", newestPost),
    ...posts.map((post) => entry(`/blog/${post.slug}`, new Date(post.updatedAt))),
    // The archives are generated from the posts, so the newest post is the newest any of them
    // can be. A per-tag date would need a second aggregation to say something no crawler
    // treats as more than a hint.
    ...tags.map(({ tag }) => entry(`/blog/tag/${tag}`, newestPost)),
    entry("/about", PAGES_LAST_MODIFIED),
    entry("/contact", PAGES_LAST_MODIFIED),
    entry("/cleaning", PAGES_LAST_MODIFIED),
    entry("/terms", LEGAL_LAST_MODIFIED),
    entry("/privacy", LEGAL_LAST_MODIFIED),
  ];
}

function entry(path: string, lastModified: Date): MetadataRoute.Sitemap[number] {
  return { url: absoluteUrl(path), lastModified };
}

/** The most recent of a set of ISO strings, or the fallback when the set is empty. */
function latest(dates: readonly string[], fallback: Date): Date {
  let newest = fallback;

  for (const value of dates) {
    const date = new Date(value);
    if (date > newest) newest = date;
  }

  return newest;
}
