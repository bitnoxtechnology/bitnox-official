import { databaseNameFromUri, fail } from "./bootstrap";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import {
  consumeAuthToken,
  inspectAuthToken,
  issueAuthToken,
  revokeAuthTokens,
} from "@/lib/auth/auth-tokens";
import { generateOtpCode, keyedHash, randomToken, verifyKeyedHash } from "@/lib/auth/crypto";
import { isSuperAdmin } from "@/lib/auth/roles";
import { discardLoginOtp, issueLoginOtp, OTP_MAX_ATTEMPTS, verifyLoginOtp } from "@/lib/auth/otp";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearRateLimit, consumeRateLimit } from "@/lib/auth/rate-limit";
import { createSession, readSession, revokeSession, revokeUserSessions } from "@/lib/auth/session";
import { connectToDatabase, disconnectFromDatabase, isDuplicateKeyError } from "@/lib/db";
import { AuthToken, OtpToken, RateLimit, Session, User } from "@/models";

/**
 * The auth flows, against a real database.
 *
 * These are integration tests on purpose. Every case Phase 3 has to get right, an expired
 * code, a locked-out account, a deactivated user, a spent link, is a fact about a document
 * and a clock rather than about a function's arguments, and a mocked collection would prove
 * only that the mock behaves as written.
 *
 *   npm run test:auth
 *
 * Runs against TEST_MONGO_URI, or MONGO_URI with the database name replaced by
 * `bitnox-official-test`, so a mistyped variable cannot put test rows in the real database.
 * Every document created here is removed afterwards.
 *
 * The connection is opened through `connectToDatabase`, the same helper the application uses,
 * with MONGO_URI pointed at the test database first. Opening a second one here instead would
 * leave the code under test talking to the development database while the test asserted
 * against this one.
 */

const TEST_DATABASE = "bitnox-official-test";
const PASSWORD = "correct-horse-42-battery";

function testUri(): string {
  const explicit = process.env.TEST_MONGO_URI;
  if (explicit) return explicit;

  const uri = process.env.MONGO_URI;
  if (!uri) fail("Neither TEST_MONGO_URI nor MONGO_URI is set.");

  const parsed = new URL(uri);
  parsed.pathname = `/${TEST_DATABASE}`;
  return parsed.toString();
}

/** Unique per run, so a failed run leaves nothing behind that the next one trips over. */
const suffix = randomToken(6)
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "");
const email = (label: string) => `${label}-${suffix}@example.test`;

async function makeUser(input: {
  label: string;
  isActive?: boolean;
  role?: "admin" | "super_admin";
}) {
  return User.create({
    name: `Test ${input.label}`,
    email: email(input.label),
    passwordHash: await hashPassword(PASSWORD),
    role: input.role ?? "admin",
    isActive: input.isActive ?? true,
  });
}

before(async () => {
  const uri = testUri();
  const name = databaseNameFromUri(uri);

  if (name !== TEST_DATABASE) {
    fail(`Refusing to run against "${name}". Tests only run against ${TEST_DATABASE}.`);
  }

  // Read lazily by `src/lib/env.ts`, so setting it here reaches the library code below.
  process.env.MONGO_URI = uri;
  await connectToDatabase();
});

after(async () => {
  const pattern = new RegExp(`${suffix}@example\\.test$`);

  const users = await User.find({ email: pattern }).select("_id").lean().exec();
  const ids = users.map((user) => user._id);

  await Promise.all([
    User.deleteMany({ email: pattern }).exec(),
    OtpToken.deleteMany({ identifier: pattern }).exec(),
    AuthToken.deleteMany({ userId: { $in: ids } }).exec(),
    Session.deleteMany({ userId: { $in: ids } }).exec(),
    RateLimit.deleteMany({ key: new RegExp(suffix) }).exec(),
  ]);

  await disconnectFromDatabase();
});

describe("passwords", () => {
  it("verifies a correct password and rejects a wrong one", async () => {
    const hash = await hashPassword(PASSWORD);

    assert.equal(await verifyPassword(hash, PASSWORD), true);
    assert.equal(await verifyPassword(hash, `${PASSWORD}!`), false);
  });

  it("returns false rather than throwing on a malformed hash", async () => {
    assert.equal(await verifyPassword("not-a-hash", PASSWORD), false);
    assert.equal(await verifyPassword("", PASSWORD), false);
  });

  it("produces a different hash for the same password each time", async () => {
    assert.notEqual(await hashPassword(PASSWORD), await hashPassword(PASSWORD));
  });
});

describe("keyed hashes", () => {
  it("verifies its own output and rejects anything else", async () => {
    const hash = await keyedHash("123456");

    assert.equal(await verifyKeyedHash("123456", hash), true);
    assert.equal(await verifyKeyedHash("123457", hash), false);
    assert.equal(await verifyKeyedHash("123456", "tampered"), false);
  });

  it("generates six-digit codes", () => {
    for (let index = 0; index < 200; index += 1) {
      assert.match(generateOtpCode(), /^\d{6}$/);
    }
  });
});

describe("login codes", () => {
  it("accepts the right code once and refuses it a second time", async () => {
    const identifier = email("otp-happy");
    const { code } = await issueLoginOtp(identifier);

    assert.deepEqual(await verifyLoginOtp(identifier, code), { ok: true });

    const replay = await verifyLoginOtp(identifier, code);
    assert.equal(replay.ok, false);
    await discardLoginOtp(identifier);
  });

  it("refuses an expired code", async () => {
    const identifier = email("otp-expired");
    const { code } = await issueLoginOtp(identifier);

    await OtpToken.updateOne(
      { identifier, purpose: "login" },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    ).exec();

    const result = await verifyLoginOtp(identifier, code);

    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.reason, "expired");
  });

  it("locks the code after five wrong attempts, even if the sixth is right", async () => {
    const identifier = email("otp-locked");
    const { code } = await issueLoginOtp(identifier);
    const wrong = code === "000000" ? "111111" : "000000";

    for (let attempt = 1; attempt <= OTP_MAX_ATTEMPTS; attempt += 1) {
      const result = await verifyLoginOtp(identifier, wrong);
      assert.equal(result.ok, false);
      assert.equal(result.ok === false && result.attemptsRemaining, OTP_MAX_ATTEMPTS - attempt);
    }

    const afterLockout = await verifyLoginOtp(identifier, code);

    assert.equal(afterLockout.ok, false);
    assert.equal(afterLockout.ok === false && afterLockout.reason, "locked");
    await discardLoginOtp(identifier);
  });

  it("replaces an earlier unspent code rather than leaving both valid", async () => {
    const identifier = email("otp-replaced");
    const first = await issueLoginOtp(identifier);
    const second = await issueLoginOtp(identifier);

    const stale = await verifyLoginOtp(identifier, first.code);
    assert.equal(stale.ok, false);

    assert.deepEqual(await verifyLoginOtp(identifier, second.code), { ok: true });
    await discardLoginOtp(identifier);
  });
});

describe("sessions", () => {
  it("reads back a live session and drops it once revoked", async () => {
    const user = await makeUser({ label: "session-live" });
    const { sessionId } = await createSession(String(user._id), { ip: "127.0.0.1" });

    const context = await readSession(sessionId);
    assert.equal(context?.user.email, user.email);

    await revokeSession(sessionId);
    assert.equal(await readSession(sessionId), null);
  });

  it("refuses an expired session", async () => {
    const user = await makeUser({ label: "session-expired" });
    const { sessionId } = await createSession(String(user._id));

    await Session.updateOne(
      { sessionId },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    ).exec();

    assert.equal(await readSession(sessionId), null);
  });

  it("refuses a session belonging to a deactivated user", async () => {
    const user = await makeUser({ label: "session-deactivated" });
    const { sessionId } = await createSession(String(user._id));

    assert.notEqual(await readSession(sessionId), null);

    await User.updateOne({ _id: user._id }, { $set: { isActive: false } }).exec();

    assert.equal(await readSession(sessionId), null);
  });

  it("ends every session but the current one on a password change", async () => {
    const user = await makeUser({ label: "session-sweep" });
    const kept = await createSession(String(user._id));
    const other = await createSession(String(user._id));

    const revoked = await revokeUserSessions(String(user._id), kept.sessionId);

    assert.equal(revoked, 1);
    assert.notEqual(await readSession(kept.sessionId), null);
    assert.equal(await readSession(other.sessionId), null);
  });

  it("returns null for a session id that was never issued", async () => {
    assert.equal(await readSession(randomToken(32)), null);
    assert.equal(await readSession(null), null);
  });
});

describe("one-time links", () => {
  it("spends an invitation once", async () => {
    const user = await makeUser({ label: "invite" });
    const { token } = await issueAuthToken({
      purpose: "invite",
      userId: String(user._id),
      email: user.email,
    });

    assert.equal((await inspectAuthToken("invite", token)).ok, true);

    const first = await consumeAuthToken("invite", token);
    assert.equal(first.ok, true);

    const second = await consumeAuthToken("invite", token);
    assert.equal(second.ok, false);
    assert.equal(second.ok === false && second.reason, "used");
  });

  it("refuses an expired reset link", async () => {
    const user = await makeUser({ label: "reset-expired" });
    const { token } = await issueAuthToken({
      purpose: "password_reset",
      userId: String(user._id),
      email: user.email,
    });

    await AuthToken.updateOne(
      { userId: user._id, purpose: "password_reset" },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    ).exec();

    const result = await consumeAuthToken("password_reset", token);

    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.reason, "expired");
  });

  it("refuses a link whose purpose does not match", async () => {
    const user = await makeUser({ label: "purpose" });
    const { token } = await issueAuthToken({
      purpose: "password_reset",
      userId: String(user._id),
      email: user.email,
    });

    const result = await consumeAuthToken("invite", token);

    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.reason, "invalid");
  });

  it("refuses a link for a deactivated account", async () => {
    const user = await makeUser({ label: "link-deactivated", isActive: false });
    const { token } = await issueAuthToken({
      purpose: "password_reset",
      userId: String(user._id),
      email: user.email,
    });

    const result = await consumeAuthToken("password_reset", token);

    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.reason, "inactive");
  });

  it("stops working when the account's email is changed underneath it", async () => {
    const user = await makeUser({ label: "link-moved" });
    const { token } = await issueAuthToken({
      purpose: "password_reset",
      userId: String(user._id),
      email: user.email,
    });

    await User.updateOne({ _id: user._id }, { $set: { email: email("link-moved-new") } }).exec();

    const result = await consumeAuthToken("password_reset", token);

    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.reason, "invalid");
  });

  it("drops outstanding links when they are revoked", async () => {
    const user = await makeUser({ label: "link-revoked" });
    const { token } = await issueAuthToken({
      purpose: "password_reset",
      userId: String(user._id),
      email: user.email,
    });

    await revokeAuthTokens(String(user._id), "password_reset");

    assert.equal((await consumeAuthToken("password_reset", token)).ok, false);
  });
});

describe("rate limiting", () => {
  const rule = { limit: 3, windowMs: 60_000 };

  it("allows up to the limit and refuses beyond it", async () => {
    const key = `test:${suffix}:allow`;

    for (let attempt = 1; attempt <= rule.limit; attempt += 1) {
      const result = await consumeRateLimit(key, rule);
      assert.equal(result.allowed, true, `attempt ${attempt} should be allowed`);
    }

    const blocked = await consumeRateLimit(key, rule);

    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSeconds > 0);
  });

  it("counts each key separately and forgets a cleared one", async () => {
    const key = `test:${suffix}:clear`;
    const other = `test:${suffix}:other`;

    await consumeRateLimit(key, rule);
    await consumeRateLimit(key, rule);
    await consumeRateLimit(key, rule);
    assert.equal((await consumeRateLimit(key, rule)).allowed, false);
    assert.equal((await consumeRateLimit(other, rule)).allowed, true);

    await clearRateLimit(key);
    assert.equal((await consumeRateLimit(key, rule)).allowed, true);
  });

  it("counts simultaneous first hits on a new key without failing", async () => {
    const key = `test:${suffix}:race`;

    // Every one of these arrives before the counter document exists, so they race to create
    // it and all but one are rejected by the unique index. On a single dev server the
    // requests queue and the race barely happens; across concurrent serverless instances it
    // does. None of them may throw, and the count still has to come out right.
    const results = await Promise.all(Array.from({ length: 8 }, () => consumeRateLimit(key, rule)));

    assert.equal(results.filter((result) => result.allowed).length, rule.limit);
    assert.ok(results.every((result) => (result.allowed ? true : result.retryAfterSeconds > 0)));
  });

  it("recovers when the insert loses the race", async () => {
    const key = `test:${suffix}:retry`;
    const original = RateLimit.findOneAndUpdate.bind(RateLimit);
    let rejected = false;

    // The race above is real but not deterministic: whether two writes actually collide is up
    // to the server. This forces the collision once, so the retry is covered on every run
    // rather than on the unlucky ones.
    RateLimit.findOneAndUpdate = ((...args: Parameters<typeof original>) => {
      if (!rejected) {
        rejected = true;
        throw Object.assign(new Error("E11000 duplicate key error"), { code: 11000 });
      }
      return original(...args);
    }) as typeof RateLimit.findOneAndUpdate;

    try {
      const result = await consumeRateLimit(key, rule);
      assert.equal(rejected, true, "the stub should have rejected the first attempt");
      assert.equal(result.allowed, true);
      assert.equal(result.remaining, rule.limit - 1);
    } finally {
      RateLimit.findOneAndUpdate = original as typeof RateLimit.findOneAndUpdate;
    }
  });

  it("does not swallow errors that are not collisions", async () => {
    const key = `test:${suffix}:other-error`;
    const original = RateLimit.findOneAndUpdate.bind(RateLimit);

    RateLimit.findOneAndUpdate = (() => {
      throw new Error("connection reset");
    }) as typeof RateLimit.findOneAndUpdate;

    try {
      await assert.rejects(() => consumeRateLimit(key, rule), /connection reset/);
    } finally {
      RateLimit.findOneAndUpdate = original as typeof RateLimit.findOneAndUpdate;
    }
  });

  it("forgets hits that have fallen out of the window", async () => {
    const key = `test:${suffix}:window`;

    await consumeRateLimit(key, rule);
    await consumeRateLimit(key, rule);
    await consumeRateLimit(key, rule);

    // Age every recorded hit past the window rather than waiting a minute for it.
    await RateLimit.updateOne(
      { key },
      { $set: { hits: [new Date(Date.now() - rule.windowMs - 1000)] } },
    ).exec();

    assert.equal((await consumeRateLimit(key, rule)).allowed, true);
  });
});

describe("duplicate keys", () => {
  it("recognises a collision and nothing else", async () => {
    const user = await makeUser({ label: "dup" });

    const collision = await User.create({
      name: "Second",
      email: user.email,
      passwordHash: await hashPassword(PASSWORD),
      role: "admin",
    }).then(
      () => null,
      (error: unknown) => error,
    );

    assert.ok(collision, "a second user with the same email should be rejected");
    assert.equal(isDuplicateKeyError(collision), true);
    assert.equal(isDuplicateKeyError(new Error("something else")), false);
    assert.equal(isDuplicateKeyError(null), false);
  });
});

describe("roles", () => {
  it("separates a super admin from a plain admin", async () => {
    const admin = await makeUser({ label: "role-admin", role: "admin" });
    const superUser = await makeUser({ label: "role-super", role: "super_admin" });

    assert.equal(isSuperAdmin({ role: admin.role }), false);
    assert.equal(isSuperAdmin({ role: superUser.role }), true);
    assert.equal(isSuperAdmin(null), false);
  });
});
