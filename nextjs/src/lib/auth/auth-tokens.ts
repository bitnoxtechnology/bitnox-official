import { keyedHash, randomToken } from "@/lib/auth/crypto";
import type { AuthTokenPurpose } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { AuthToken, User, type IUser } from "@/models";

/**
 * One-time links for invitations and password resets.
 *
 * Both flows end with somebody choosing a password, and in both the only proof on offer is
 * that they can read a mailbox. So both are the same mechanism with different lifetimes: an
 * invitation is expected to sit unread for a day or two, a reset is expected to be clicked
 * within the hour.
 *
 * No admin ever sets another user's password. An invitation creates the account with an
 * unusable random hash, and the invitee replaces it.
 */

/** Three days. An invitation often arrives while somebody is away from their desk. */
export const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

/** One hour. A reset link is acted on immediately or not at all. */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function ttlFor(purpose: AuthTokenPurpose): number {
  return purpose === "invite" ? INVITE_TTL_MS : PASSWORD_RESET_TTL_MS;
}

export interface IssuedAuthToken {
  token: string;
  expiresAt: Date;
}

/**
 * Creates a link token and returns it in plain text, once.
 *
 * Earlier tokens of the same purpose for the same user are dropped, so a second reset request
 * invalidates the first email. Otherwise every request a user makes while confused leaves
 * another working link in their inbox.
 */
export async function issueAuthToken(input: {
  purpose: AuthTokenPurpose;
  userId: string;
  email: string;
  invitedBy?: string;
}): Promise<IssuedAuthToken> {
  await connectToDatabase();

  await AuthToken.deleteMany({ userId: input.userId, purpose: input.purpose }).exec();

  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + ttlFor(input.purpose));

  await AuthToken.create({
    tokenHash: await keyedHash(token),
    purpose: input.purpose,
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    expiresAt,
    invitedBy: input.invitedBy,
  });

  return { token, expiresAt };
}

export type AuthTokenFailure = "invalid" | "expired" | "used" | "inactive";

export type AuthTokenResult = { ok: true; user: IUser } | { ok: false; reason: AuthTokenFailure };

/**
 * Spends a link token and hands back the account it belongs to.
 *
 * The address on the token is compared with the account's current address. If an account's
 * email has been changed since the link was sent, the link stops working, so a link mailed to
 * an address the person no longer controls cannot be used to take the account.
 */
export async function consumeAuthToken(
  purpose: AuthTokenPurpose,
  token: string,
): Promise<AuthTokenResult> {
  await connectToDatabase();

  const trimmed = token.trim();
  if (!trimmed) return { ok: false, reason: "invalid" };

  const record = await AuthToken.findOne({
    tokenHash: await keyedHash(trimmed),
    purpose,
  }).exec();

  if (!record) return { ok: false, reason: "invalid" };
  if (record.consumedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "expired" };

  const user = await User.findById(record.userId).exec();
  if (!user) return { ok: false, reason: "invalid" };
  if (!user.isActive) return { ok: false, reason: "inactive" };
  if (user.email !== record.email) return { ok: false, reason: "invalid" };

  // Conditional, so two clicks on the same link produce one password change and one error.
  const consumed = await AuthToken.findOneAndUpdate(
    { _id: record._id, consumedAt: { $exists: false } },
    { $set: { consumedAt: new Date() } },
  ).exec();

  if (!consumed) return { ok: false, reason: "used" };

  return { ok: true, user };
}

/**
 * Reads a token without spending it, for the page that renders the form.
 *
 * Showing somebody a password form and only then telling them the link expired is a poor
 * order of events, so the page checks first and the action consumes on submit.
 */
export async function inspectAuthToken(
  purpose: AuthTokenPurpose,
  token: string,
): Promise<{ ok: true; email: string; name: string } | { ok: false; reason: AuthTokenFailure }> {
  await connectToDatabase();

  const trimmed = token.trim();
  if (!trimmed) return { ok: false, reason: "invalid" };

  const record = await AuthToken.findOne({
    tokenHash: await keyedHash(trimmed),
    purpose,
  })
    .lean()
    .exec();

  if (!record) return { ok: false, reason: "invalid" };
  if (record.consumedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "expired" };

  const user = await User.findById(record.userId).select("name email isActive").lean().exec();

  if (!user) return { ok: false, reason: "invalid" };
  if (!user.isActive) return { ok: false, reason: "inactive" };
  if (user.email !== record.email) return { ok: false, reason: "invalid" };

  return { ok: true, email: user.email, name: user.name };
}

export async function revokeAuthTokens(userId: string, purpose: AuthTokenPurpose): Promise<void> {
  await connectToDatabase();
  await AuthToken.deleteMany({ userId, purpose }).exec();
}
