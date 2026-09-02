import { cookies, headers } from "next/headers";

import { PENDING_COOKIE, PENDING_TTL_MS, SESSION_COOKIE } from "@/lib/auth/config";
import { readSignedPayload, signPayload, signValue, unsignValue } from "@/lib/auth/crypto";
import type { SessionMetadata } from "@/lib/auth/session";

/**
 * Reading and writing the two auth cookies.
 *
 * Both are httpOnly, so no script can read them, `sameSite=lax`, so they do not ride along on
 * a cross-site POST, and `secure` outside development, where there is no HTTPS to require.
 *
 * Writing a cookie is only possible in a server action or a route handler. Server components
 * may read them, which is why the reads and the writes are separate functions here rather
 * than one that quietly does both.
 */

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
} as const;

export async function setSessionCookie(sessionId: string, expiresAt: Date): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signValue(sessionId), {
    ...baseCookieOptions,
    expires: expiresAt,
  });
}

/** The session id out of the cookie, or null if it is absent or the signature fails. */
export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return unsignValue(store.get(SESSION_COOKIE)?.value);
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export interface PendingLogin {
  userId: string;
  email: string;
  /** Epoch milliseconds. Checked on read, since a cookie expiry is only a browser hint. */
  exp: number;
}

export async function setPendingLoginCookie(userId: string, email: string): Promise<void> {
  const expires = new Date(Date.now() + PENDING_TTL_MS);
  const store = await cookies();

  store.set(
    PENDING_COOKIE,
    await signPayload({ userId, email, exp: expires.getTime() } satisfies PendingLogin),
    { ...baseCookieOptions, expires },
  );
}

export async function readPendingLoginCookie(): Promise<PendingLogin | null> {
  const store = await cookies();
  const payload = await readSignedPayload<PendingLogin>(store.get(PENDING_COOKIE)?.value);

  if (!payload?.userId || !payload.email) return null;
  if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;

  return payload;
}

export async function clearPendingLoginCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

/**
 * Who and what made the request, for the session record and the rate limiter.
 *
 * `x-forwarded-for` is a list, and only the first entry is the client. Behind Vercel the
 * header is set by the platform, so it cannot be spoofed by the caller.
 */
export async function requestMetadata(): Promise<SessionMetadata & { ip: string }> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0] ?? list.get("x-real-ip") ?? "unknown").trim();

  return { ip: ip || "unknown", userAgent: list.get("user-agent") ?? undefined };
}
