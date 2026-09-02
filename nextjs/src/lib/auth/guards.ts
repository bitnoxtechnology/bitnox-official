import { cache } from "react";
import { redirect } from "next/navigation";

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

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
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
