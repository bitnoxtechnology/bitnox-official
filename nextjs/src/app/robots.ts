import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/urls";

/**
 * robots.txt.
 *
 * One rule for every crawler. Singling out user agents is how a robots file ends up with a
 * block nobody can explain two years later, and there is nothing on this site that Googlebot
 * should be allowed to read and Bingbot should not.
 *
 * `robots.txt` controls crawling, not indexing, which is the distinction that decides what
 * belongs here. A URL disallowed below can still appear in results if something links to it,
 * so anything that must stay out of the index says so in its own `metadata.robots` as well:
 * the admin layout is `noindex`, and so is the unsubscribe page. These entries stop the
 * crawl budget being spent on pages that would return a sign-in screen or a draft.
 *
 * `/api/` covers the signature endpoint, the cron route and the webhooks. None of them
 * returns HTML and none of them should be fetched by a crawler at all.
 *
 * The sitemap is named absolutely, which the standard requires. `absoluteUrl` reads
 * `NEXT_PUBLIC_SITE_URL`, so a preview deployment points at its own sitemap rather than at
 * production's.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        // The unsubscribe page is reached from a link in an email and is `noindex`.
        "/newsletter/unsubscribe",
        // The admin's preview of an unpublished post.
        "/blog/*/preview",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
