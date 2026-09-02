import { ADMIN_ROOT } from "@/lib/auth/config";

/**
 * The `next` parameter, read from the address bar at submit time.
 *
 * It used to be rendered into a hidden input by the server, which meant the sign-in form
 * could not be drawn until `searchParams` had resolved, and that put the whole form behind a
 * Suspense fallback on every visit. Reading it here instead keeps the form static: nothing
 * is rendered from this value, so there is no server and client mismatch to worry about, and
 * the form is interactive the moment the shell arrives.
 *
 * The value is not trusted. `safeNext` in the server action rejects anything that is not an
 * admin path, which it would have to do anyway, since the parameter arrives from the URL.
 */
export function nextFromLocation(): string {
  if (typeof window === "undefined") return ADMIN_ROOT;
  return new URLSearchParams(window.location.search).get("next") ?? ADMIN_ROOT;
}
