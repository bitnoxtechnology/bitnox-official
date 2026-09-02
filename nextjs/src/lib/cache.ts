/**
 * Cache tags.
 *
 * Public pages are statically generated and never time-revalidated. What replaces the timer
 * is this list: every cached read declares one of these tags, and every admin mutation that
 * changes public content calls `revalidateTag()` with the same one before it returns.
 *
 * They are constants rather than string literals at the call sites because the two halves of
 * that contract live in different files. A typo in a `revalidateTag("portolio")` is silent:
 * the mutation succeeds, nothing is invalidated, and the page stays wrong until the next
 * deployment.
 */

export const CACHE_TAGS = {
  blog: "blog",
  portfolio: "portfolio",
  testimonials: "testimonials",
  eventSpace: "event-space",
  siteSettings: "site-settings",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** A single post or project, so publishing one does not invalidate the whole index. */
export function itemTag(tag: CacheTag, slug: string): string {
  return `${tag}:${slug}`;
}
