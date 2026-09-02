import { connectToDatabase, isDuplicateKeyError } from "@/lib/db";
import { RateLimit } from "@/models/rate-limit.model";

/**
 * Sliding-window rate limiting for the credential endpoints.
 *
 * Every limit is applied twice, once per IP address and once per email address. Per IP alone
 * lets a botnet spread an attack on one account across many addresses. Per email alone lets
 * one host walk a password list across many accounts. Neither is much use without the other.
 */

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

const MINUTE = 60_000;

export const RATE_LIMITS = {
  /** Password submissions. The per-email figure is the one a password-guessing run hits. */
  loginPerIp: { limit: 20, windowMs: 15 * MINUTE },
  loginPerEmail: { limit: 5, windowMs: 15 * MINUTE },

  /** Asking for a code. Each request sends an email, so this is also a mail-cost limit. */
  otpRequestPerEmail: { limit: 5, windowMs: 15 * MINUTE },
  otpRequestPerIp: { limit: 15, windowMs: 15 * MINUTE },

  /** Code submissions. The five-attempt lockout on the code itself is the tighter bound. */
  otpVerifyPerIp: { limit: 30, windowMs: 15 * MINUTE },
  otpVerifyPerEmail: { limit: 10, windowMs: 15 * MINUTE },

  passwordResetPerEmail: { limit: 3, windowMs: 60 * MINUTE },
  passwordResetPerIp: { limit: 10, windowMs: 60 * MINUTE },
} as const satisfies Record<string, RateLimitRule>;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window has room again. Zero while the request is allowed. */
  retryAfterSeconds: number;
}

/**
 * Records an attempt and reports whether it is within the limit.
 *
 * One atomic round trip. The pipeline drops the hits that have fallen out of the window,
 * appends this one, and caps the array at `limit + 1` entries so a sustained attack cannot
 * grow the document without bound. Reading the count and writing the hit in separate
 * queries would let two concurrent requests both see the same count and both pass.
 *
 * The one case the round trip does not cover is the very first hit on a key, where two
 * requests can both find nothing and both try to insert. `key` is unique, so one of them is
 * rejected. That is the common case on a sign-in page rather than an exotic one, and on
 * serverless the two requests are usually on different instances, so it is retried once
 * below rather than surfaced as a failed sign-in.
 */
export async function consumeRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  await connectToDatabase();

  const now = new Date();
  const windowStart = new Date(now.getTime() - rule.windowMs);

  const record = await recordHit(key, rule, now, windowStart);

  const hits = record?.hits ?? [now];
  const allowed = hits.length <= rule.limit;
  const oldest = hits[0] ?? now;

  return {
    allowed,
    remaining: Math.max(0, rule.limit - hits.length),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((oldest.getTime() + rule.windowMs - now.getTime()) / 1000)),
  };
}

/**
 * The upsert, and one retry if it lost the race to create the document.
 *
 * The retry is safe and cannot loop: by the time the collision is reported the winner's
 * document exists, so the second attempt is an ordinary update with nothing left to collide
 * with. It records the hit it was always going to record.
 */
async function recordHit(
  key: string,
  rule: RateLimitRule,
  now: Date,
  windowStart: Date,
): Promise<{ hits: Date[] } | null> {
  try {
    return await upsertHit(key, rule, now, windowStart);
  } catch (error: unknown) {
    if (!isDuplicateKeyError(error)) throw error;
    return upsertHit(key, rule, now, windowStart);
  }
}

async function upsertHit(
  key: string,
  rule: RateLimitRule,
  now: Date,
  windowStart: Date,
): Promise<{ hits: Date[] } | null> {
  return RateLimit.findOneAndUpdate(
    { key },
    [
      {
        $set: {
          hits: {
            $slice: [
              {
                $concatArrays: [
                  {
                    $filter: {
                      input: { $ifNull: ["$hits", []] },
                      as: "hit",
                      cond: { $gt: ["$$hit", windowStart] },
                    },
                  },
                  [now],
                ],
              },
              -(rule.limit + 1),
            ],
          },
          expiresAt: new Date(now.getTime() + rule.windowMs),
          // Set here because Mongoose cannot apply its own timestamps to a pipeline update.
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
    ],
    { new: true, upsert: true, projection: { hits: 1 } },
  )
    .lean()
    .exec();
}

/**
 * Applies several limits together, stopping at the first one that is exhausted.
 *
 * Stopping early means a request blocked by its IP limit does not also spend the account's
 * email budget, so one attacker cannot lock a real user out by attacking their address.
 */
export async function enforceRateLimits(
  entries: ReadonlyArray<readonly [string, RateLimitRule]>,
): Promise<RateLimitResult> {
  for (const [key, rule] of entries) {
    const result = await consumeRateLimit(key, rule);
    if (!result.allowed) return result;
  }

  return { allowed: true, remaining: 0, retryAfterSeconds: 0 };
}

/** Called after a successful sign-in, so a forgotten password costs nothing afterwards. */
export async function clearRateLimit(key: string): Promise<void> {
  await connectToDatabase();
  await RateLimit.deleteOne({ key }).exec();
}

/** Rounded to whole minutes, because a user-facing message does not need the seconds. */
export function retryAfterMessage(seconds: number): string {
  if (seconds <= 60) return "Try again in a minute.";
  return `Try again in ${Math.ceil(seconds / 60)} minutes.`;
}
