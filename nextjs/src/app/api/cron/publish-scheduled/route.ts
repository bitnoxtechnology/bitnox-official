import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CACHE_TAGS, itemTag } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { Blog } from "@/models";

/**
 * Promotes scheduled posts whose time has come.
 *
 * A route handler rather than a server action, because this is the one thing on the site
 * that has to be an HTTP endpoint: a scheduler outside the application calls it on a timer,
 * and there is no session, no form and no user behind the request.
 *
 * It exists because nothing else can move a post from `scheduled` to `published`. Public
 * pages are statically generated and invalidated by tag, never by a timer, so a scheduled
 * post does not appear because a page happened to re-render at the right moment. Something
 * has to flip the status and call `revalidateTag`, and this is it.
 *
 * The authorisation is a bearer token compared against `CRON_SECRET`. Vercel Cron sends
 * exactly that header, and comparing it in constant time closes off the timing side channel
 * that a plain `===` on a secret opens. There is no fallback to an IP allowlist or a header a
 * caller can set for themselves: this endpoint publishes writing, and an unauthenticated
 * caller must get nothing but a 401.
 *
 * The work is idempotent. Running it twice in the same minute promotes nothing the second
 * time, because the first run moved every matching post out of `scheduled`. That matters
 * because a scheduler that retries on a timeout is normal and must not double-publish.
 *
 * Each post is saved individually rather than through `updateMany`. The `pre("validate")`
 * hook on the model is what sets `publishedAt` and keeps the reading time in step, and an
 * `updateMany` bypasses it, which would publish posts that sort as though they were never
 * written. A handful of documents per run is not a query to optimise.
 */

/** Constant-time, and false rather than throwing on a header that is missing or malformed. */
function isAuthorised(request: NextRequest): boolean {
  const header = request.headers.get("authorization") ?? "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  const expected = serverEnv.CRON_SECRET;

  if (supplied.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}

export async function GET(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await connectToDatabase();

  const now = new Date();

  const due = await Blog.find({
    status: "scheduled",
    scheduledFor: { $lte: now },
  }).exec();

  const published: string[] = [];

  for (const post of due) {
    post.status = "published";
    // The scheduled time, not the moment the cron happened to run. A post scheduled for
    // nine o'clock and promoted at nine minutes past should read as having gone out at nine.
    post.publishedAt = post.scheduledFor ?? now;
    post.scheduledFor = undefined;

    await post.save();
    published.push(post.slug);
  }

  if (published.length > 0) {
    // The index, the landing page band and the service reading lists all read the `blog`
    // tag. The per-slug tags cover the post pages themselves, which are cached separately so
    // that publishing one does not discard the rendered HTML of the rest.
    revalidateTag(CACHE_TAGS.blog, "max");
    for (const slug of published) revalidateTag(itemTag(CACHE_TAGS.blog, slug), "max");
  }

  return NextResponse.json({
    checkedAt: now.toISOString(),
    published: published.length,
    slugs: published,
  });
}

/**
 * The same work, for schedulers that send POST.
 *
 * Vercel Cron uses GET. Others default to POST, and having the endpoint answer only one of
 * them is the kind of detail that is discovered a week after a post failed to appear.
 */
export const POST = GET;
