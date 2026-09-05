import { StaggerGroup } from "@/components/motion";
import { BlogCard } from "@/components/site";
import type { BlogCardDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * A grid of posts.
 *
 * The one place on the site that decides how a list of posts is laid out, so the index, the
 * tag archives and the related block below a post cannot end up with three different column
 * counts and three different gaps.
 *
 * A card is the right shape here and almost nowhere else. The page composition rule reserves
 * frames for image-led content, and a post is exactly that: a distinct linked object with a
 * picture, a title and a date.
 *
 * `priority` is given to the first card only, and only where the caller says this grid is the
 * first thing on the page. On the index it is the likely LCP element; in the related block at
 * the foot of a post it is far below the fold, and marking it urgent there would compete with
 * the cover image the reader is actually looking at.
 */
export function PostGrid({
  posts,
  priorityFirst = false,
  className,
}: {
  posts: readonly BlogCardDTO[];
  priorityFirst?: boolean;
  className?: string;
}) {
  if (posts.length === 0) return null;

  return (
    <StaggerGroup
      asChild
      selector="li"
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      <ul>
        {posts.map((post, index) => (
          <li key={post.id} className="h-full">
            <BlogCard post={post} priority={priorityFirst && index === 0} className="h-full" />
          </li>
        ))}
      </ul>
    </StaggerGroup>
  );
}
