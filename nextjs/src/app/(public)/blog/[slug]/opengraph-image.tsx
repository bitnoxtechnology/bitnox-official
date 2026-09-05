import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";
import { getPostBySlug } from "@/lib/queries/blog";

/**
 * The social card for a post.
 *
 * Generated rather than uploaded, so every post has one whether or not anybody remembered to
 * make an image for it. A post that does have a cover photograph names it in its metadata,
 * and that wins: a real picture of the thing being written about is better than a title on a
 * dark rectangle. This is the floor, not the ceiling.
 *
 * It reads the post through the same cached query the page uses, so generating the card
 * costs one shared database read at build rather than one of its own per post.
 *
 * These are drawn at build time for every prerendered slug, and on demand for a post
 * published since the last build.
 */

export const alt = "Bitnox Technology Solutions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function BlogPostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return renderOgCard({
    eyebrow: post?.category ?? "Blog",
    // A slug that has no post is a 404 on the page itself. The card still has to return an
    // image rather than throw, because a crawler asks for it independently of the page.
    title: post?.title ?? "Bitnox Technology Solutions",
    meta: post ? `${post.readingMinutes} minute read` : undefined,
  });
}
