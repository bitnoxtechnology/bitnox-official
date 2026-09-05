import "server-only";

import { keyedHash, verifyKeyedHash } from "@/lib/auth/crypto";

/**
 * Preview links for posts that are not published.
 *
 * `/blog/[slug]` is statically generated and only ever renders published posts, so a draft
 * reaching it is a 404 to everybody, crawlers included. That is the correct behaviour for the
 * public route and it leaves the editor with no way to see their work in the real layout,
 * which is what `/blog/[slug]/preview` is for.
 *
 * Two gates, not one. The token proves the link was issued by this application for this
 * slug, and `requireUser()` on the preview route proves the person following it is signed in.
 * Either alone would be too weak: a token on its own becomes a public URL the moment it is
 * forwarded, and a session on its own would let any signed-in account walk the slug space.
 *
 * The token is a keyed hash rather than a random string in a table, because there is nothing
 * to store: it carries no expiry of its own and grants nothing without a session, so a row
 * per draft would be bookkeeping for a value that can be recomputed.
 */

function payload(slug: string): string {
  return `blog-preview:${slug}`;
}

export async function createPreviewToken(slug: string): Promise<string> {
  return keyedHash(payload(slug));
}

/** Constant-time, and false rather than throwing on a token that is missing or malformed. */
export async function verifyPreviewToken(
  slug: string,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  return verifyKeyedHash(payload(slug), token);
}

/** The link the admin hands an editor. Relative, so it works on any environment. */
export async function previewPath(slug: string): Promise<string> {
  return `/blog/${slug}/preview?token=${encodeURIComponent(await createPreviewToken(slug))}`;
}
