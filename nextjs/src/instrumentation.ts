/**
 * Boot-time environment validation.
 *
 * `src/lib/env.ts` parses lazily, on first access. That is what keeps the parse out of the
 * build, but it also means a missing variable stays quiet until something reads it, and the
 * first thing to read it in production is usually `proxy.ts` verifying a session cookie. A
 * missing `CLOUDINARY_API_SECRET` then presents as every admin route returning 500, with
 * nothing about Cloudinary anywhere near the request that failed.
 *
 * Reading both halves here moves that to the top of the log, at the point the server starts,
 * where the message names the variable.
 *
 * The Edge runtime is skipped. It has its own module instance with a narrower environment,
 * and the Node.js check is the one that covers every server variable this app uses.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { clientEnv, serverEnv } = await import("@/lib/env");

  // Touch one key from each schema. Access is what triggers the parse, and the parse is
  // all-or-nothing, so one read of each validates the lot.
  void serverEnv.SESSION_SECRET;
  void clientEnv.NEXT_PUBLIC_SITE_URL;
}
