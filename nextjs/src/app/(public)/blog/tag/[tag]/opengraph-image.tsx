import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";

/**
 * The social card for one tag archive.
 *
 * The tag is the whole point of the page, so it is the whole point of the card. It is read
 * from the route parameter rather than from the database, because the archive's own heading
 * is derived the same way and a second source could disagree with it.
 *
 * Generated on demand rather than at build. Tags come and go with the posts that carry them,
 * and prerendering a card for a tag that may not exist next week buys nothing.
 */

export const alt = "The Bitnox blog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function BlogTagOgImage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const readable = decodeURIComponent(tag).replace(/-/g, " ");

  return renderOgCard({
    eyebrow: "Blog",
    title: `Posts about ${readable}`,
  });
}
