import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { toBlogCard, type BlogCardDTO } from "@/lib/dto";
import { Blog, type IBlog } from "@/models";
// Registers User on the connection, so populating the byline does not throw.
import "@/models";

/**
 * Published posts, for the landing page and the blog index.
 *
 * The filter is `status: "published"` and a `publishedAt` in the past. A scheduled post has
 * its own status and is excluded by the first condition, so the date check only guards the
 * case where a post was published with a future date by hand.
 *
 * `new Date()` inside a cached function pins a moment into the cache entry, which is the
 * intended behaviour here: the entry is invalidated by tag when a post is published, and the
 * scheduled-publish cron calls `revalidateTag` when it flips a post over. Nothing depends on
 * the clock ticking between those two events.
 */
export async function getLatestPosts(limit = 3): Promise<BlogCardDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  await connectToDatabase();

  const posts = await Blog.find({ status: "published", publishedAt: { $lte: new Date() } })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate("author", "name")
    .select("-contentJson -contentHtml")
    .lean<IBlog[]>()
    .exec();

  return posts.map(toBlogCard);
}

/**
 * Published posts carrying any of a set of tags, for the reading list on a service page.
 *
 * Tags rather than a category, because a post about search optimisation belongs to Web
 * Development and to the blog's own SEO tag at the same time, and a single category field
 * would force a choice between the two.
 *
 * The service pages call this with the tags named in `src/content/services.ts`. Nothing here
 * fails when the database has no posts with those tags in it, which is the state the site
 * launches in: the section calling this renders nothing at all until there is something to
 * link to, so a service page never carries a heading over an empty row.
 */
export async function getPostsByTags(tags: readonly string[], limit = 3): Promise<BlogCardDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  if (tags.length === 0) return [];

  await connectToDatabase();

  const posts = await Blog.find({
    status: "published",
    publishedAt: { $lte: new Date() },
    tags: { $in: tags },
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate("author", "name")
    .select("-contentJson -contentHtml")
    .lean<IBlog[]>()
    .exec();

  return posts.map(toBlogCard);
}
