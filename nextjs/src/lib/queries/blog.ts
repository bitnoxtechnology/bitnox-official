import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS, itemTag } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { toBlog, toBlogCard, type BlogCardDTO, type BlogDTO } from "@/lib/dto";
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

/**
 * The blog index, one page at a time.
 *
 * Pagination is offset-based rather than cursor-based, which is the right trade here: the
 * index is sorted by one indexed field, the reader needs numbered pages they can link to,
 * and a crawler needs `/blog?page=3` to mean the same thing tomorrow. A cursor gives
 * neither. The `skip` cost that makes offset pagination a problem elsewhere does not arise
 * on a collection this size.
 *
 * Tag and category are applied here rather than filtered in the page, so the total matches
 * what is shown and a filtered view is paginated correctly instead of claiming four pages
 * over six posts.
 */
export interface BlogPage {
  posts: BlogCardDTO[];
  total: number;
  page: number;
  pageCount: number;
}

export const POSTS_PER_PAGE = 9;

export async function getBlogPage(
  options: { page?: number; tag?: string; category?: string } = {},
): Promise<BlogPage> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  await connectToDatabase();

  const filter: Record<string, unknown> = {
    status: "published",
    publishedAt: { $lte: new Date() },
  };

  if (options.tag) filter.tags = options.tag;
  if (options.category) filter.category = options.category;

  const total = await Blog.countDocuments(filter).exec();
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  // Clamped rather than trusted. `?page=900` is a URL anybody can type, and an unclamped
  // skip would return an empty list under a heading saying there are posts on it.
  const page = Math.min(Math.max(1, Math.trunc(options.page ?? 1)), pageCount);

  const posts = await Blog.find(filter)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * POSTS_PER_PAGE)
    .limit(POSTS_PER_PAGE)
    .populate("author", "name")
    .select("-contentJson -contentHtml")
    .lean<IBlog[]>()
    .exec();

  return { posts: posts.map(toBlogCard), total, page, pageCount };
}

/**
 * One published post, with its rendered HTML.
 *
 * Two tags. `blog` invalidates every post at once, which is what a change to an author's
 * name or a bulk edit needs, and the per-slug tag lets the admin republish one post without
 * discarding the cached HTML of the other forty.
 *
 * Returns null rather than throwing on a slug that does not exist or is not published. The
 * page turns that into `notFound()`, which is the same answer for a draft, a typo and an
 * archived post. That is deliberate: an anonymous visitor must not be able to tell which
 * unpublished slugs exist by the shape of the response.
 */
export async function getPostBySlug(slug: string): Promise<BlogDTO | null> {
  "use cache";
  cacheTag(CACHE_TAGS.blog, itemTag(CACHE_TAGS.blog, slug));
  cacheLife("max");

  await connectToDatabase();

  const post = await Blog.findOne({
    slug,
    status: "published",
    publishedAt: { $lte: new Date() },
  })
    .populate("author", "name")
    .select("-contentJson")
    .lean<IBlog | null>()
    .exec();

  return post ? toBlog(post) : null;
}

/**
 * The same post in any state, for the signed-in preview route.
 *
 * Uncached and untagged, because a draft changes on every save and a cached draft is a
 * preview of what the writer wrote a while ago. The route that calls this is behind
 * `requireUser()` and a preview token.
 */
export async function getPostBySlugForPreview(slug: string): Promise<BlogDTO | null> {
  await connectToDatabase();

  const post = await Blog.findOne({ slug })
    .populate("author", "name")
    .select("-contentJson")
    .lean<IBlog | null>()
    .exec();

  return post ? toBlog(post) : null;
}

/**
 * Every published slug, for `generateStaticParams`.
 *
 * Only the slug is selected. This runs once per build over the whole collection, and pulling
 * the rendered HTML of every post into memory to read one string from each is the kind of
 * query that is fine at forty posts and not at four hundred.
 */
export async function getPublishedPostSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  await connectToDatabase();

  const posts = await Blog.find({ status: "published", publishedAt: { $lte: new Date() } })
    .sort({ publishedAt: -1 })
    .select("slug")
    .lean<{ slug: string }[]>()
    .exec();

  return posts.map((post) => post.slug);
}

/**
 * Slug and dates for every published post, for the sitemap.
 *
 * `lastModified` in a sitemap has to be a real date or it is worse than absent, so this
 * returns `updatedAt` rather than the build time. Nothing else is selected.
 */
export interface PostIndexEntry {
  slug: string;
  publishedAt?: string;
  updatedAt: string;
}

export async function getPublishedPostIndex(): Promise<PostIndexEntry[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  await connectToDatabase();

  const posts = await Blog.find({ status: "published", publishedAt: { $lte: new Date() } })
    .sort({ publishedAt: -1 })
    .select("slug publishedAt updatedAt")
    .lean<IBlog[]>()
    .exec();

  return posts.map((post) => ({
    slug: post.slug,
    publishedAt: post.publishedAt?.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));
}

/**
 * Posts sharing tags with this one, most recent first.
 *
 * Shared tags rather than "the three most recent posts". A related block that shows whatever
 * was written last is a second copy of the index, and this is the one thing on a post page
 * that can send a reader deeper rather than back.
 *
 * The post itself is excluded in the query rather than filtered out of the result, which is
 * what stops a request for three coming back with two.
 */
export async function getRelatedPosts(
  slug: string,
  tags: readonly string[],
  limit = 3,
): Promise<BlogCardDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  if (tags.length === 0) return [];

  await connectToDatabase();

  const posts = await Blog.find({
    status: "published",
    publishedAt: { $lte: new Date() },
    slug: { $ne: slug },
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

/**
 * Every tag in use, with how many published posts carry it.
 *
 * An aggregation rather than reading the tag array of every post and counting in JavaScript,
 * because the counts decide the order and the database can produce them without sending the
 * posts.
 *
 * Only tags on published posts appear, so a tag invented on a draft does not produce an
 * archive page with nothing on it.
 */
export interface TagCount {
  tag: string;
  count: number;
}

export async function getPublishedTags(): Promise<TagCount[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  await connectToDatabase();

  const rows = await Blog.aggregate<{ _id: string; count: number }>([
    { $match: { status: "published", publishedAt: { $lte: new Date() } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]).exec();

  return rows.map((row) => ({ tag: row._id, count: row.count }));
}

/** The categories in use on published posts, alphabetically. */
export async function getPublishedCategories(): Promise<string[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("max");

  await connectToDatabase();

  const categories = await Blog.distinct("category", {
    status: "published",
    publishedAt: { $lte: new Date() },
  }).exec();

  return (categories as (string | null)[])
    .filter((category): category is string => Boolean(category))
    .sort((a, b) => a.localeCompare(b, "en-GB"));
}
