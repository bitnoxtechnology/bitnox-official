/**
 * Names and paths shared by the cookie helpers, the server actions and `proxy.ts`.
 *
 * `proxy.ts` cannot import anything that reaches `next/headers` or Mongoose, so the few
 * values it needs live here on their own rather than in the modules that use them.
 */

/** Signed session id. The only cookie that proves who somebody is. */
export const SESSION_COOKIE = "bitnox_session";

/**
 * The half-finished sign-in between password and code.
 *
 * A signed, expiring payload rather than a database row. It proves the password step was
 * passed and names the account waiting on a code, and it is worthless on its own because the
 * code itself is not in it.
 */
export const PENDING_COOKIE = "bitnox_pending";

/** Ten minutes, matching the code's own lifetime. */
export const PENDING_TTL_MS = 10 * 60_000;

export const ADMIN_ROOT = "/admin";
export const LOGIN_PATH = "/admin/login";
export const VERIFY_PATH = "/admin/verify";

/**
 * The `/admin` pages that must stay reachable without a session.
 *
 * Anything not on this list is guarded. New admin routes are protected by default, which is
 * the right way round: forgetting to add a route here fails closed.
 */
export const ADMIN_PUBLIC_PATHS = [
  LOGIN_PATH,
  VERIFY_PATH,
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/accept-invite",
] as const;

export function isPublicAdminPath(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
