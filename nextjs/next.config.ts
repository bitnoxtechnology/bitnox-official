import path from "node:path";
import type { NextConfig } from "next";

/**
 * Slugs from the legacy blog whose posts do not exist in this database.
 *
 * The database starts empty and nothing is migrated, so every old post URL is a 404 on the
 * new site and a lost ranking with it. A redirect to `/blog` keeps the link and the crawler
 * on the site rather than on an error page. It is not a redirect to an equivalent post,
 * because there is no equivalent post; a 301 to the index is the honest answer.
 *
 * This has to be an explicit list rather than a catch-all, because `/blog/[slug]` is also the
 * shape of every new post, and a rule matching it would redirect posts written next month.
 *
 * Fill it from Search Console, not from memory: Indexing, Pages, then the indexed URL list
 * for the old site, filtered to `/blog/`. Guessing produces redirects for URLs nobody had and
 * misses the ones that were actually ranking. Until that export exists the list stays empty,
 * which is the correct state for it: the 404 page carries real navigation, so an unlisted old
 * URL is handled, just less well.
 */
const LEGACY_BLOG_SLUGS: string[] = [];

/**
 * Old project or case study URLs, redirected to the portfolio index.
 *
 * The legacy application had no project pages at all: the work appeared as three cards on the
 * landing page and nothing else. So this exists for URLs that were linked from elsewhere,
 * from a proposal or a social post, rather than from anything the old site published. The
 * same Search Console export fills it, and it stays empty until one shows up in it.
 */
const LEGACY_PROJECT_PATHS: string[] = [];

const nextConfig: NextConfig = {
  // The legacy client/ and server/ apps leave lockfiles above this directory, so Turbopack
  // infers the wrong workspace root. Pin it. Remove once those apps are deleted at cutover.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },

  // Cache Components: enables `use cache`, `cacheTag` and `cacheLife`, which is how public
  // pages are statically generated and invalidated by tag on admin mutation.
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  /**
   * The redirect map from the legacy Vite application.
   *
   * Every one of these is permanent, which is what a 301 is for: the old URL is not coming
   * back, and a 302 asks a crawler to keep checking and passes on less. They are worth having
   * because a redirect keeps whatever authority the old URL had and keeps a visitor following
   * a two-year-old link on the site.
   *
   * The routes the old application served were `/`, `/about`, `/cleaning`, `/contact`,
   * `/blogs`, `/blog/:slug`, `/terms`, `/privacy`, `/auth/login` and `/admin/manage-*`. Every
   * path in the first group is the same on the new site and needs no rule. What is left is
   * the blog index, which was renamed, the sign-in page, and the admin pages, which were
   * reorganised.
   */
  async redirects() {
    return [
      // The one rename in the public route map.
      { source: "/blogs", destination: "/blog", permanent: true },
      // Never a route the old app served, but the shape somebody types or links to after
      // seeing `/blogs`, and it costs one line to send them to the post rather than a 404.
      { source: "/blogs/:slug", destination: "/blog/:slug", permanent: true },

      // Sign-in moved under the admin, which is where the rest of it already was.
      { source: "/auth/login", destination: "/admin/login", permanent: true },
      { source: "/auth/:path*", destination: "/admin/login", permanent: true },

      // The admin pages lost the "manage-" prefix, which said nothing that the section it
      // sits in was not already saying.
      { source: "/admin/manage-blog", destination: "/admin/blog", permanent: true },
      { source: "/admin/manage-portfolio", destination: "/admin/portfolio", permanent: true },
      { source: "/admin/manage-testimonials", destination: "/admin/testimonials", permanent: true },
      { source: "/admin/manage-users", destination: "/admin/users", permanent: true },
      { source: "/admin/manage-newsletter", destination: "/admin/newsletter", permanent: true },

      ...LEGACY_BLOG_SLUGS.map((slug) => ({
        source: `/blog/${slug}`,
        destination: "/blog",
        permanent: true,
      })),

      ...LEGACY_PROJECT_PATHS.map((legacyPath) => ({
        source: legacyPath,
        destination: "/portfolio",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
