import "server-only";

import { connection } from "next/server";

import { connectToDatabase } from "@/lib/db";

/**
 * What every admin list returns, and why none of them is cached.
 *
 * The public queries in the folder above are all `"use cache"` with a tag, because a reader
 * is looking at content that changes rarely and is invalidated deliberately. An admin is
 * looking at the thing they just edited. A cached list would show them the row as it was
 * before they saved it, and no tag can fix that without invalidating the reader's pages on
 * every keystroke in a search box.
 *
 * These functions are also uncached because their arguments come from the URL. A cache keyed
 * on a free-text search term is a cache with one entry per thing anybody has ever typed.
 *
 * Every one of them is called from a page or an action that has already run a guard. They do
 * not guard themselves, because a query that redirects is a query that cannot be reused.
 */

/**
 * Opens the connection, and says out loud that this read happens per request.
 *
 * `connection()` is the declaration that makes Cache Components stop trying to prerender the
 * caller. Without it the build attempts to render the admin at build time, reaches the Mongo
 * driver's own clock read and fails with an unstable-value error, which is a confusing way to
 * be told something obvious: an admin screen is a live view of a database and there is nothing
 * about it to prerender.
 *
 * The guard on the page is not enough on its own. A page that reads the session and a count
 * together issues both at once, so the count can reach the driver before the cookie read has
 * marked anything dynamic. Declaring it here makes it true of the query rather than dependent
 * on the order a caller happens to await things in.
 */
export async function connectForRequest(): Promise<void> {
  await connection();
  await connectToDatabase();
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageCount: number;
  perPage: number;
}

export const ADMIN_PER_PAGE = 20;

/**
 * The page number, clamped to what actually exists.
 *
 * `?page=900` on a list of twelve is a URL anybody can type. Unclamped it produces a skip
 * past the end and an empty table under a heading that says there are rows.
 */
export function paginate(total: number, page: number, perPage = ADMIN_PER_PAGE) {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, Math.trunc(page)), pageCount);

  return { pageCount, page: current, skip: (current - 1) * perPage, limit: perPage };
}

/**
 * A search box turned into a case-insensitive match, with the regular expression characters
 * in it defused first.
 *
 * Mongo takes a regular expression here, so a search for `C++` or `a.b` would otherwise be
 * compiled as a pattern rather than matched as text, and a term like `(((` would throw.
 */
export function searchPattern(term: string): RegExp {
  return new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
