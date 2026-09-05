import { PostGrid } from "@/app/(public)/blog/_sections/post-grid";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { getRelatedPosts } from "@/lib/queries/blog";

/**
 * Other posts on the same subject.
 *
 * Driven by shared tags rather than by recency. A reader who has just finished a piece on
 * migrating a business system is interested in the other pieces on business systems, and a
 * block showing whatever happened to be written last is a second copy of the index sitting
 * at the foot of every post.
 *
 * It renders nothing when there is nothing to show, which is the state a new blog is in for
 * its first few posts. A heading over an empty row, or over two posts that share no subject
 * at all, is worse than the section not being there.
 */
export async function RelatedPosts({ slug, tags }: { slug: string; tags: readonly string[] }) {
  const posts = await getRelatedPosts(slug, tags, 3);

  if (posts.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Related reading"
            title="More on the same subject"
            description="Posts sharing a topic with this one, most recent first."
          />
          <ActionButton href="/blog" variant="outline" size="sm">
            Every post
          </ActionButton>
        </div>

        <PostGrid posts={posts} className="mt-section-sm" />
      </div>
    </section>
  );
}
