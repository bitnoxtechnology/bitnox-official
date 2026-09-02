import { randomToken } from "@/lib/auth/crypto";
import { connectToDatabase } from "@/lib/db";
import { toUser, type UserDTO } from "@/lib/dto";
import { Session, User, type IUser } from "@/models";

/**
 * Server-side sessions.
 *
 * The cookie carries a signed session id and nothing else, so revoking a session is a write
 * to one row rather than a wait for a token to expire. That is the whole reason for choosing
 * this over the legacy access and refresh token pair: an admin who is deactivated at 10am
 * stops being able to act at 10am.
 *
 * Nothing here reads or writes cookies. The cookie handling lives in `cookies.ts`, which
 * keeps this module usable from scripts and tests, where there is no request to read.
 */

/** Seven days. Long enough not to nag, short enough that a stolen laptop expires. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionContext {
  user: UserDTO;
  sessionId: string;
  expiresAt: Date;
}

export interface SessionMetadata {
  userAgent?: string;
  ip?: string;
}

export async function createSession(
  userId: string,
  metadata: SessionMetadata = {},
): Promise<{ sessionId: string; expiresAt: Date }> {
  await connectToDatabase();

  const sessionId = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await Session.create({
    sessionId,
    userId,
    expiresAt,
    userAgent: metadata.userAgent?.slice(0, 512),
    ip: metadata.ip?.slice(0, 64),
  });

  return { sessionId, expiresAt };
}

/**
 * The session behind a cookie, or null.
 *
 * Expiry is checked here rather than trusted to the TTL index, which sweeps roughly once a
 * minute and would otherwise leave a window where an expired session still works. The
 * `isActive` check is what makes deactivating a user take effect on their next request
 * instead of at the end of their session.
 */
export async function readSession(sessionId: string | null): Promise<SessionContext | null> {
  if (!sessionId) return null;

  await connectToDatabase();

  const session = await Session.findOne({ sessionId, revokedAt: { $exists: false } })
    .populate<{ userId: IUser }>("userId")
    .exec();

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await revokeSession(sessionId);
    return null;
  }

  const user = session.userId as IUser | null;

  if (!user || !user.isActive) {
    if (user) await revokeUserSessions(String(user._id));
    return null;
  }

  return { user: toUser(user), sessionId, expiresAt: session.expiresAt };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await connectToDatabase();
  await Session.updateOne(
    { sessionId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  ).exec();
}

/**
 * Ends every session for a user, optionally sparing the one making the request.
 *
 * Called on password change, password reset and deactivation. A password change that leaves
 * an attacker's existing session alive has not locked them out of anything.
 */
export async function revokeUserSessions(
  userId: string,
  exceptSessionId?: string,
): Promise<number> {
  await connectToDatabase();

  const filter: Record<string, unknown> = { userId, revokedAt: { $exists: false } };
  if (exceptSessionId) filter.sessionId = { $ne: exceptSessionId };

  const result = await Session.updateMany(filter, { $set: { revokedAt: new Date() } }).exec();
  return result.modifiedCount;
}

/** Recorded on sign-in. Failure to write it must not fail the sign-in, hence the catch. */
export async function markSignedIn(userId: string): Promise<void> {
  await connectToDatabase();
  await User.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } })
    .exec()
    .catch(() => undefined);
}
