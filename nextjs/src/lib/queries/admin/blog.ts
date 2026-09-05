import "server-only";

import {
  ADMIN_PER_PAGE,
  connectForRequest,
  paginate,
  searchPattern,
  type Paginated,
} from "@/lib/queries/admin/shared";
import { toBlogCard, toBlogEditor, type BlogCardDTO, type BlogEditorDTO } from "@/lib/dto";
import type { ListQuery } from "@/lib/validations/admin-schema";
import { Blog, type IBlog } from "@/models";
// Registers User on the connection, so populating the byline does not throw.
import "@/models";

/**
 * Every post, in every state, for the admin list.
 *
 * The public query filters to `published` and a date in the past. This one deliberately does
 * not: the drafts and the scheduled posts are the reason the screen exists.
 *
 * Sorted by `updatedAt` rather than by publication date, because an admin opening this list
 * is almost always looking for the thing they were last working on, not the thing that was
 * published first.
 */
export async function listBlogPosts(query: ListQuery): Promise<Paginated<BlogCardDTO>> {
  await connectForRequest();

  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;

  if (query.q) {
    const pattern = searchPattern(query.q);
    filter.$or = [{ title: pattern }, { slug: pattern }, { excerpt: pattern }, { tags: pattern }];
  }

  const total = await Blog.countDocuments(filter).exec();
  const { page, pageCount, skip, limit } = paginate(total, query.page);

  const posts = await Blog.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name")
    .select("-contentJson -contentHtml")
    .lean<IBlog[]>()
    .exec();

  return { rows: posts.map(toBlogCard), total, page, pageCount, perPage: ADMIN_PER_PAGE };
}

/**
 * One post with its Tiptap document, for the edit screen.
 *
 * The only read on the site that returns `contentJson`. Everything public reads the rendered
 * snapshot instead, which is what keeps the editor out of a reader's bundle.
 */
export async function getBlogForEditor(id: string): Promise<BlogEditorDTO | null> {
  await connectForRequest();

  const post = await Blog.findById(id).populate("author", "name").lean<IBlog | null>().exec();

  return post ? toBlogEditor(post) : null;
}

/** The counts behind the status tabs, in one round trip rather than four. */
export async function countBlogByStatus(): Promise<Record<string, number>> {
  await connectForRequest();

  const rows = await Blog.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]).exec();

  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}
