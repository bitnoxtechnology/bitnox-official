import { generateOtpCode, keyedHash, verifyKeyedHash } from "@/lib/auth/crypto";
import { connectToDatabase } from "@/lib/db";
import { OtpToken } from "@/models";

/**
 * The emailed six-digit login code.
 *
 * A password alone is one factor and the admin can publish to a live site, so the code is the
 * second. It is short lived, single use, and gives up after five wrong guesses, which between
 * them leave an attacker holding a stolen password with a one in two hundred thousand chance
 * per issued code.
 */

/** Ten minutes. Long enough for a slow mail hop, short enough to be worth little if read. */
export const OTP_TTL_MS = 10 * 60_000;

/** Five wrong guesses and the code is dead. Requesting a new one is the way forward. */
export const OTP_MAX_ATTEMPTS = 5;

export type OtpFailure = "missing" | "expired" | "locked" | "invalid";

export type OtpVerification =
  { ok: true } | { ok: false; reason: OtpFailure; attemptsRemaining: number };

/**
 * Issues a code and returns it in plain text, once, for the mail template.
 *
 * Any earlier unspent code for the same address is deleted first. Leaving them alive would
 * mean several valid codes at a time, which multiplies the guessing odds by the number
 * outstanding and lets anyone extend their own window by requesting more.
 */
export async function issueLoginOtp(identifier: string): Promise<{
  code: string;
  expiresAt: Date;
}> {
  await connectToDatabase();

  const email = identifier.trim().toLowerCase();
  await OtpToken.deleteMany({ identifier: email, purpose: "login" }).exec();

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await OtpToken.create({
    identifier: email,
    codeHash: await keyedHash(code),
    purpose: "login",
    expiresAt,
    attempts: 0,
  });

  return { code, expiresAt };
}

/**
 * Checks a submitted code and, on success, spends it.
 *
 * The attempt counter is incremented before the comparison and conditionally on being under
 * the limit, so five parallel submissions cannot all read `attempts: 4` and all be allowed
 * through. Consumption is a conditional update for the same reason: two requests carrying the
 * correct code produce one session, not two.
 */
export async function verifyLoginOtp(identifier: string, code: string): Promise<OtpVerification> {
  await connectToDatabase();

  const email = identifier.trim().toLowerCase();

  const token = await OtpToken.findOne({
    identifier: email,
    purpose: "login",
    consumedAt: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .exec();

  if (!token) return { ok: false, reason: "missing", attemptsRemaining: 0 };

  if (token.expiresAt.getTime() <= Date.now()) {
    await OtpToken.deleteOne({ _id: token._id }).exec();
    return { ok: false, reason: "expired", attemptsRemaining: 0 };
  }

  const counted = await OtpToken.findOneAndUpdate(
    { _id: token._id, attempts: { $lt: OTP_MAX_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { new: true },
  ).exec();

  if (!counted) return { ok: false, reason: "locked", attemptsRemaining: 0 };

  const attemptsRemaining = Math.max(0, OTP_MAX_ATTEMPTS - counted.attempts);

  if (!(await verifyKeyedHash(code.trim(), counted.codeHash))) {
    return {
      ok: false,
      reason: attemptsRemaining === 0 ? "locked" : "invalid",
      attemptsRemaining,
    };
  }

  const consumed = await OtpToken.findOneAndUpdate(
    { _id: counted._id, consumedAt: { $exists: false } },
    { $set: { consumedAt: new Date() } },
  ).exec();

  if (!consumed) return { ok: false, reason: "missing", attemptsRemaining: 0 };

  return { ok: true };
}

/** Used when a sign-in is abandoned, so an unspent code does not outlive the attempt. */
export async function discardLoginOtp(identifier: string): Promise<void> {
  await connectToDatabase();
  await OtpToken.deleteMany({ identifier: identifier.trim().toLowerCase(), purpose: "login" })
    .exec()
    .catch(() => undefined);
}
