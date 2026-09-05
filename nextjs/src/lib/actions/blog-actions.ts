"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  fail,
  ok,
  text,
  toActionState,
  validate,
  type ActionResult,
  type ActionState,
} from "@/lib/actions/action-state";
import { withAuth } from "@/lib/actions/with-auth";
import { requireUser } from "@/lib/auth/guards";
import { previewPath } from "@/lib/blog/preview";
import { docToPlainText, renderContentHtml } from "@/lib/blog/render";
import { CACHE_TAGS, itemTag } from "@/lib/cache";
import type { PublishStatus } from "@/lib/constants";
import { connectToDatabase, isDuplicateKeyError } from "@/lib/db";
import { idSchema } from "@/lib/validations/admin-schema";
import { blogSchema, blogStatusSchema, type BlogData } from "@/lib/validations/blog-schema";
import { Blog } from "@/models";
import type { TiptapDoc } from "@/models/shared";

/**
 * Blog administration.
 *
 * Every export here goes through `withAuth`, which makes the guard part of the action's
 * definition rather than something the next person has to remember to write at the top.
 * `proxy.ts` guarding the admin routes sees a signed cookie and nothing else, so it cannot
 * know that a session was revoked or an account deactivated. It is defence in depth.
 *
 * Two things happen on every write and both matter.
 *
 * The Tiptap JSON is rendered to HTML here, on the server, and both are stored. `contentJson`
 * is the source of truth and `contentHtml` is a snapshot, so a reader gets a paragraph of
 * text without downloading the editor to see it.
 *
 * Then the cache tags are invalidated. Public pages are statically generated and never
 * time-revalidated, so a published post that does not call revalidateTag stays invisible
 * until the next deployment.
 */

/**
 * The two tags a post affects, invalidated together.
 *
 * The old slug goes as well on an edit that renamed it: the page cached under the previous
 * URL is now a page for a post that has moved.
 */
function revalidateBlog(slug: string, previousSlug?: string): void {
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidateTag(itemTag(CACHE_TAGS.blog, slug), "max");
  if (previousSlug && previousSlug !== slug)
    revalidateTag(itemTag(CACHE_TAGS.blog, previousSlug), "max");
}

/** Everything the model needs, derived once and shared by create and update. */
function documentFrom(data: BlogData, authorId: string) {
  return {
    title: data.title,
    excerpt: data.excerpt,
    contentJson: data.contentJson as TiptapDoc,
    contentHtml: renderContentHtml(data.contentJson as TiptapDoc),
    coverImage: data.coverImage,
    ogImage: data.ogImage,
    status: data.status,
    // A scheduled post keeps its date. Anything else drops it, so a post moved back to draft
    // does not silently republish itself the next time the cron runs.
    scheduledFor: data.status === "scheduled" ? data.scheduledFor : undefined,
    tags: data.tags,
    category: data.category,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    canonicalUrl: data.canonicalUrl,
    featured: data.featured,
    author: authorId,
  };
}

function parseBlogForm(formData: FormData): ActionResult<BlogData> {
  return validate(blogSchema, {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    contentJson: text(formData, "contentJson"),
    coverImage: text(formData, "coverImage"),
    ogImage: text(formData, "ogImage"),
    status: text(formData, "status"),
    scheduledFor: text(formData, "scheduledFor"),
    tags: text(formData, "tags"),
    category: text(formData, "category"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    canonicalUrl: text(formData, "canonicalUrl"),
    featured: text(formData, "featured"),
  });
}

const SLUG_TAKEN = "A post already uses that slug. Choose another.";

// --- Create -----------------------------------------------------------------

/**
 * Creates the post and hands back its id, so the form can redirect to the edit screen.
 *
 * A redirect rather than a success message: after "create" the writer is on paragraph one,
 * not finished, and leaving them on a form that no longer corresponds to a new document is
 * how a second copy of the post gets made by a second submission.
 */
export const createBlogAction = withAuth<[FormData], { id: string; slug: string }>(
  async (user, formData) => {
    const parsed = parseBlogForm(formData);
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    try {
      const post = await Blog.create({
        ...documentFrom(parsed.data, user.id),
        // Omitted when blank, so the model derives it from the title. That is the only time
        // a slug is generated; after this it changes only when an admin edits it on purpose.
        ...(parsed.data.slug ? { slug: parsed.data.slug } : {}),
      });

      revalidateBlog(post.slug);

      return ok({ id: String(post._id), slug: post.slug });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) return fail(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
      throw error;
    }
  },
);

export async function createBlogFormAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await createBlogAction(formData);

  if (!result.ok) return toActionState(result);

  redirect(`/admin/blog/${result.data.id}?created=1`);
}

// --- Update -----------------------------------------------------------------

export const updateBlogAction = withAuth<[string, FormData], { slug: string }>(
  async (_user, id, formData) => {
    const identified = validate(idSchema, { id });
    if (!identified.ok) return identified;

    const parsed = parseBlogForm(formData);
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const post = await Blog.findById(identified.data.id).exec();
    if (!post) return fail("That post no longer exists.");

    const previousSlug = post.slug;
    // The author is not reassigned on edit. A byline belongs to whoever wrote the piece, not
    // to whoever last corrected a typo in it.
    const { author: _author, ...fields } = documentFrom(parsed.data, String(post.author));

    post.set(fields);
    if (parsed.data.slug) post.slug = parsed.data.slug;

    // Cleared by assignment rather than through `set`, because Mongoose reads an `undefined`
    // in a `set` payload as "leave this alone", and a post moved out of `scheduled` would
    // keep the date the cron watches.
    if (parsed.data.status !== "scheduled") post.scheduledFor = undefined;

    try {
      await post.save();
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) return fail(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
      throw error;
    }

    revalidateBlog(post.slug, previousSlug);

    return ok({ slug: post.slug }, "Saved.");
  },
);

export async function updateBlogFormAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return toActionState(await updateBlogAction(id, formData), "Saved.");
}

// --- Status transitions -----------------------------------------------------

/**
 * Moving a post between draft, scheduled, published and archived from the list.
 *
 * Each transition means something different, so this writes the dates that go with the state
 * rather than only the state. Publishing stamps `publishedAt` if the post has never had one.
 * Unpublishing does not clear it, because the original publication date is a fact about the
 * post and a re-publish should not present a two-year-old article as new.
 *
 * Scheduling from here is refused when the post has no date on it. The list has no field to
 * type one into, and a scheduled post with no `scheduledFor` is one the cron will never pick
 * up: it would sit in a state that reads as "going out soon" and never go out.
 */
export const setBlogStatusAction = withAuth<[string, PublishStatus], { status: PublishStatus }>(
  async (_user, id, status) => {
    const parsed = validate(blogStatusSchema, { id, status });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const post = await Blog.findById(parsed.data.id).exec();
    if (!post) return fail("That post no longer exists.");

    if (parsed.data.status === "scheduled" && !post.scheduledFor) {
      return fail("Open the post and choose a date before scheduling it.");
    }

    post.status = parsed.data.status;

    if (parsed.data.status === "published" && !post.publishedAt) post.publishedAt = new Date();
    if (parsed.data.status !== "scheduled") post.scheduledFor = undefined;

    await post.save();
    revalidateBlog(post.slug);

    return ok({ status: post.status });
  },
);

// --- Duplicate --------------------------------------------------------------

/**
 * A copy, as a draft, with the title marked.
 *
 * The slug is left for the model to derive from the new title, so the copy cannot collide
 * with the original and cannot quietly take over its URL. The publication date, the schedule,
 * the featured flag and the view count are dropped: they belong to the post that was
 * published, not to a draft nobody has seen.
 */
export const duplicateBlogAction = withAuth<[string], { id: string }>(async (user, id) => {
  const parsed = validate(idSchema, { id });
  if (!parsed.ok) return parsed;

  await connectToDatabase();

  const post = await Blog.findById(parsed.data.id).lean().exec();
  if (!post) return fail("That post no longer exists.");

  const copy = await Blog.create({
    title: `${post.title} (copy)`,
    excerpt: post.excerpt,
    contentJson: post.contentJson,
    contentHtml: post.contentHtml,
    coverImage: post.coverImage,
    ogImage: post.ogImage,
    status: "draft",
    tags: post.tags,
    category: post.category,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    author: user.id,
    featured: false,
  });

  revalidateTag(CACHE_TAGS.blog, "max");

  return ok({ id: String(copy._id) });
});

// --- Delete -----------------------------------------------------------------

/**
 * Removed, not archived.
 *
 * `archived` already exists as a status for a post that should stop being published but keep
 * its URL and its history. Delete is for the other case, a draft that was a mistake, and
 * collapsing the two would leave no way to actually get rid of one.
 */
export const deleteBlogAction = withAuth<[string], { slug: string }>(async (_user, id) => {
  const parsed = validate(idSchema, { id });
  if (!parsed.ok) return parsed;

  await connectToDatabase();

  const post = await Blog.findByIdAndDelete(parsed.data.id).lean().exec();
  if (!post) return fail("That post no longer exists.");

  revalidateBlog(post.slug);

  return ok({ slug: post.slug }, "Post deleted.");
});

// --- Preview and excerpt ----------------------------------------------------

/**
 * The signed link that lets an editor see a draft in the real layout.
 *
 * The public post route only renders published posts, so a draft is a 404 there to everybody.
 * The preview route is the way round that, and it is behind both a token and `requireUser()`,
 * so a forwarded link is worth nothing on its own.
 */
export async function getPreviewLinkAction(slug: string): Promise<string> {
  await requireUser();
  return previewPath(slug);
}

/**
 * The excerpt the editor offers to fill in, taken from the body already typed.
 *
 * A suggestion rather than a default. The excerpt is the search snippet and the card text, so
 * it is worth writing on purpose, but the first two sentences of the article are a better
 * starting point than an empty field.
 */
export async function suggestExcerptAction(contentJson: string): Promise<string> {
  await requireUser();

  try {
    return docToPlainText(JSON.parse(contentJson) as TiptapDoc).slice(0, 300);
  } catch {
    return "";
  }
}
