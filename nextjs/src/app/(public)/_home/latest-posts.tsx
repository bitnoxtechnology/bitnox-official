import { StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { BlogCard } from "@/components/site/blog-card";
import { getLatestPosts } from "@/lib/queries/blog";

/**
 * The three most recent published posts.
 *
 * Cached under the `blog` tag, so publishing a post from the admin, or the scheduled-publish
 * cron flipping one over at its appointed time, updates this section and the blog index
 * together.
 *
 * Hidden until there is something to show, like the other two data-backed sections. A "no
 * posts yet" panel on a landing page tells a first-time visitor that the site is unfinished.
 */
export async function LatestPosts() {
  const posts = await getLatestPosts(3);

  if (posts.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="From the blog"
            title="What we have been writing about"
            description="Notes on the work: what we built, what broke, and what we would do differently."
          />
          <ActionButton href="/blog" variant="outline">
            Read the blog
          </ActionButton>
        </div>

        <StaggerGroup asChild className="mt-section-sm grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ul>
            {posts.map((post) => (
              <li key={post.id} className="h-full">
                <BlogCard post={post} className="h-full" />
              </li>
            ))}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
