import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { ADMIN_ROOT, LOGIN_PATH } from "@/lib/auth/config";
import { readSessionCookie } from "@/lib/auth/cookies";
import { isSuperAdmin } from "@/lib/auth/roles";
import { readSession, type SessionContext } from "@/lib/auth/session";
import type { UserDTO } from "@/lib/dto";

/**
 * The authorisation boundary.
 *
 * `proxy.ts` also guards `/admin/*`, but it only sees that a signed cookie is present. It
 * does not read the database, so it cannot know that the session was revoked, that it has
 * expired, or that the account has been deactivated. That makes it defence in depth and these
 * functions the actual boundary, which is why every protected page and every server action
 * calls one of them before touching data.
 *
 * `cache` deduplicates the lookup within a request, so a layout, a page and an action in the
 * same render share one database read.
 */

/**
 * Who is signed in, or nobody.
 *
 * `connection()` first, and it is not a formality. Reading the cookie already makes this
 * request-bound, but the session check also compares the stored expiry against the clock, and
 * Cache Components refuses to prerender a render that reaches an unstable value like
 * `Date.now()` without being told the render is happening per request. Without this line the
 * first route to call a guard outside a cached function fails to prerender, and the message it
 * fails with points at a Mongoose line rather than at the session read that caused it.
 *
 * Declaring it here rather than in each caller is what makes it reliable. A page that reads the
 * session alongside another query issues both at once, so whether anything had yet marked the
 * render dynamic came down to which promise resolved first.
 *
 * It costs nothing that was not already true: every route that asks who is signed in is a route
 * that cannot be part of a static shell.
 */
export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  await connection();
  return readSession(await readSessionCookie());
});

export async function getCurrentUser(): Promise<UserDTO | null> {
  return (await getSessionContext())?.user ?? null;
}

export { isSuperAdmin };

/** Redirects to the sign-in page when there is no usable session. */
export async function requireUser(): Promise<UserDTO> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
}

/**
 * Sends a signed-in admin back to the dashboard rather than to the sign-in page.
 *
 * They are authenticated, so asking them to sign in again would be misleading, and it would
 * loop. The dashboard does not offer them the link in the first place.
 */
export async function requireSuperAdmin(): Promise<UserDTO> {
  const user = await requireUser();
  if (!isSuperAdmin(user)) redirect(`${ADMIN_ROOT}?denied=super_admin`);
  return user;
}
