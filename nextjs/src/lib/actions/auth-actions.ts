"use server";

import { redirect } from "next/navigation";

import {
  consumeAuthToken,
  issueAuthToken,
  revokeAuthTokens,
  type AuthTokenFailure,
} from "@/lib/auth/auth-tokens";
import { ADMIN_ROOT, LOGIN_PATH, VERIFY_PATH } from "@/lib/auth/config";
import {
  clearPendingLoginCookie,
  clearSessionCookie,
  readPendingLoginCookie,
  readSessionCookie,
  requestMetadata,
  setPendingLoginCookie,
  setSessionCookie,
} from "@/lib/auth/cookies";
import { randomToken } from "@/lib/auth/crypto";
import { getSessionContext, requireSuperAdmin, requireUser } from "@/lib/auth/guards";
import { discardLoginOtp, issueLoginOtp, verifyLoginOtp } from "@/lib/auth/otp";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearRateLimit,
  enforceRateLimits,
  RATE_LIMITS,
  retryAfterMessage,
} from "@/lib/auth/rate-limit";
import { createSession, markSignedIn, revokeSession, revokeUserSessions } from "@/lib/auth/session";
import {
  errorState,
  fieldErrorsFrom,
  successState,
  type ActionState,
} from "@/lib/actions/action-state";
import { connectToDatabase, isDuplicateKeyError } from "@/lib/db";
import { sendInvite, sendLoginCode, sendPasswordReset } from "@/lib/mail/auth-mail";
import {
  acceptInviteSchema,
  changePasswordSchema,
  inviteUserSchema,
  loginSchema,
  otpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth-schema";
import { User } from "@/models";

/**
 * Sign-in, one-time codes, invitations, password reset and password change.
 *
 * Two rules run through all of it. Nothing here tells an anonymous caller whether an email
 * address has an account, because a sign-in form that does is an account enumeration tool.
 * And every action that touches a protected resource calls a guard first, rather than
 * trusting that `proxy.ts` kept the caller out.
 */

/** The generic answer to a bad email, a bad password, or both. */
const CREDENTIALS_REJECTED = "That email address and password do not match.";

const INVALID_FORM = "Check the highlighted fields and try again.";

/**
 * A verify against a throwaway hash, run when no account matches the address.
 *
 * Without it a missing account answers in a millisecond and a real one takes the tens of
 * milliseconds argon2 costs, and that difference is a reliable test for whether an address
 * is registered. The hash is computed once per process and never matches anything.
 */
let decoyHash: Promise<string> | undefined;

async function equalizeTiming(password: string): Promise<void> {
  decoyHash ??= hashPassword(randomToken(24));
  await verifyPassword(await decoyHash, password);
}

/** Only same-origin admin paths, so a crafted `next` cannot bounce anyone off the site. */
function safeNext(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/admin") || path.startsWith("//")) return ADMIN_ROOT;
  return path;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Said the same way whether the address was found by the check or by the unique index. */
function emailTaken(): ActionState {
  const message = "An account with that email address already exists.";
  return errorState(message, { email: [message] });
}

function linkFailureMessage(reason: AuthTokenFailure, noun: string): string {
  switch (reason) {
    case "expired":
      return `This ${noun} link has expired. Ask for a new one.`;
    case "used":
      return `This ${noun} link has already been used. Ask for a new one.`;
    case "inactive":
      return "This account is not active. Ask a super admin to restore it.";
    default:
      return `This ${noun} link is not valid. Check that you copied all of it.`;
  }
}

// --- Sign in ----------------------------------------------------------------

/**
 * Step one: the password.
 *
 * A correct password does not create a session. It issues a code and a short-lived pending
 * cookie that names the account waiting on it, which is what makes a stolen password on its
 * own insufficient.
 */
export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });

  if (!parsed.success) return errorState(INVALID_FORM, fieldErrorsFrom(parsed.error));

  const { email, password } = parsed.data;
  const { ip } = await requestMetadata();

  const limit = await enforceRateLimits([
    [`login:ip:${ip}`, RATE_LIMITS.loginPerIp],
    [`login:email:${email}`, RATE_LIMITS.loginPerEmail],
  ]);

  if (!limit.allowed) {
    return errorState(`Too many sign-in attempts. ${retryAfterMessage(limit.retryAfterSeconds)}`);
  }

  await connectToDatabase();

  const user = await User.findOne({ email }).select("+passwordHash").exec();

  if (!user) {
    await equalizeTiming(password);
    return errorState(CREDENTIALS_REJECTED);
  }

  if (!(await verifyPassword(user.passwordHash, password))) {
    return errorState(CREDENTIALS_REJECTED);
  }

  // Said plainly, because the password was correct. There is nothing left to conceal from
  // somebody who has already proved they hold it, and "wrong password" would send a real
  // admin round in circles.
  if (!user.isActive) {
    return errorState("This account has been deactivated. Ask a super admin to restore it.");
  }

  const { code } = await issueLoginOtp(user.email);
  await sendLoginCode({ to: user.email, name: user.name, code });
  await setPendingLoginCookie(String(user._id), user.email);

  const next = safeNext(formData.get("next"));
  redirect(`${VERIFY_PATH}?next=${encodeURIComponent(next)}`);
}

/**
 * Step two: the code.
 *
 * The account is re-read here rather than trusted from the pending cookie, so a user
 * deactivated during the two minutes between the two steps does not get a session.
 */
export async function verifyOtpAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pending = await readPendingLoginCookie();

  if (!pending) {
    return errorState("That sign-in attempt has expired. Enter your password again.");
  }

  const parsed = otpSchema.safeParse({ code: text(formData, "code") });
  if (!parsed.success) return errorState(INVALID_FORM, fieldErrorsFrom(parsed.error));

  const { ip, userAgent } = await requestMetadata();

  const limit = await enforceRateLimits([
    [`otp-verify:ip:${ip}`, RATE_LIMITS.otpVerifyPerIp],
    [`otp-verify:email:${pending.email}`, RATE_LIMITS.otpVerifyPerEmail],
  ]);

  if (!limit.allowed) {
    return errorState(`Too many attempts. ${retryAfterMessage(limit.retryAfterSeconds)}`);
  }

  const result = await verifyLoginOtp(pending.email, parsed.data.code);

  if (!result.ok) {
    switch (result.reason) {
      case "expired":
        return errorState("That code has expired. Ask for a new one.");
      case "locked":
        return errorState("Too many wrong codes. Ask for a new one.");
      case "missing":
        return errorState("There is no code waiting. Ask for a new one.");
      default:
        return errorState(
          result.attemptsRemaining === 1
            ? "That code is not right. One attempt left."
            : `That code is not right. ${result.attemptsRemaining} attempts left.`,
        );
    }
  }

  await connectToDatabase();
  const user = await User.findById(pending.userId).exec();

  if (!user || !user.isActive) {
    await clearPendingLoginCookie();
    return errorState("This account is not active. Ask a super admin to restore it.");
  }

  const { sessionId, expiresAt } = await createSession(String(user._id), { ip, userAgent });

  await setSessionCookie(sessionId, expiresAt);
  await clearPendingLoginCookie();
  await markSignedIn(String(user._id));
  await clearRateLimit(`login:email:${user.email}`);

  redirect(safeNext(formData.get("next")));
}

/** A new code for the same pending sign-in. The previous one is deleted as it is replaced. */
export async function resendOtpAction(
  _previous: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const pending = await readPendingLoginCookie();

  if (!pending) {
    return errorState("That sign-in attempt has expired. Enter your password again.");
  }

  const { ip } = await requestMetadata();

  const limit = await enforceRateLimits([
    [`otp-request:ip:${ip}`, RATE_LIMITS.otpRequestPerIp],
    [`otp-request:email:${pending.email}`, RATE_LIMITS.otpRequestPerEmail],
  ]);

  if (!limit.allowed) {
    return errorState(`Too many codes requested. ${retryAfterMessage(limit.retryAfterSeconds)}`);
  }

  await connectToDatabase();
  const user = await User.findById(pending.userId).exec();

  if (!user || !user.isActive) {
    await clearPendingLoginCookie();
    return errorState("This account is not active. Ask a super admin to restore it.");
  }

  const { code } = await issueLoginOtp(user.email);
  await sendLoginCode({ to: user.email, name: user.name, code });

  return successState(`A new code is on its way to ${user.email}.`);
}

/** Abandons a half-finished sign-in, so the unspent code does not outlive the attempt. */
export async function cancelLoginAction(): Promise<void> {
  const pending = await readPendingLoginCookie();
  if (pending) await discardLoginOtp(pending.email);

  await clearPendingLoginCookie();
  redirect(LOGIN_PATH);
}

export async function logoutAction(): Promise<void> {
  const sessionId = await readSessionCookie();
  if (sessionId) await revokeSession(sessionId);

  await clearSessionCookie();
  await clearPendingLoginCookie();
  redirect(LOGIN_PATH);
}

// --- Password reset ---------------------------------------------------------

/**
 * Answers identically whether or not the address has an account.
 *
 * A form that says "no account with that email" is a way to test addresses against the admin
 * roster, so the message, and as far as possible the timing, are the same either way.
 */
export async function requestPasswordResetAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: text(formData, "email") });
  if (!parsed.success) return errorState(INVALID_FORM, fieldErrorsFrom(parsed.error));

  const { email } = parsed.data;
  const { ip } = await requestMetadata();

  const acknowledgement = successState(
    "If that address has an account, a reset link is on its way. The link expires in an hour.",
  );

  const limit = await enforceRateLimits([
    [`reset:ip:${ip}`, RATE_LIMITS.passwordResetPerIp],
    [`reset:email:${email}`, RATE_LIMITS.passwordResetPerEmail],
  ]);

  // Also the same acknowledgement. A "slow down" here would confirm the address is real.
  if (!limit.allowed) return acknowledgement;

  await connectToDatabase();
  const user = await User.findOne({ email }).select("name email isActive").exec();

  if (user?.isActive) {
    const { token } = await issueAuthToken({
      purpose: "password_reset",
      userId: String(user._id),
      email: user.email,
    });

    await sendPasswordReset({ to: user.email, name: user.name, token });
  }

  return acknowledgement;
}

/**
 * Sets the new password and signs every device out.
 *
 * A reset is what somebody does when they think the password is known to another person, so
 * leaving that person's session alive would defeat the point of the exercise.
 */
export async function resetPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: text(formData, "token"),
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });

  if (!parsed.success) return errorState(INVALID_FORM, fieldErrorsFrom(parsed.error));

  const consumed = await consumeAuthToken("password_reset", parsed.data.token);
  if (!consumed.ok) return errorState(linkFailureMessage(consumed.reason, "reset"));

  const userId = String(consumed.user._id);

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        passwordHash: await hashPassword(parsed.data.password),
        passwordChangedAt: new Date(),
      },
    },
  ).exec();

  await revokeUserSessions(userId);
  await revokeAuthTokens(userId, "password_reset");
  await discardLoginOtp(consumed.user.email);
  await clearRateLimit(`login:email:${consumed.user.email}`);

  redirect(`${LOGIN_PATH}?reset=done`);
}

// --- Invitations ------------------------------------------------------------

/**
 * Creates the account and mails the link that lets its owner choose a password.
 *
 * The account is created with a random hash nobody holds, so it exists but cannot be signed
 * into until the invitation is accepted. If the mail does not go out the account is removed
 * again, rather than left as an unreachable row that the next invitation would collide with.
 */
export async function inviteUserAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const inviter = await requireSuperAdmin();

  const parsed = inviteUserSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email"),
    role: text(formData, "role"),
  });

  if (!parsed.success) return errorState(INVALID_FORM, fieldErrorsFrom(parsed.error));

  const { name, email, role } = parsed.data;

  await connectToDatabase();

  if (await User.exists({ email })) return emailTaken();

  // The check above is a courtesy, not the guarantee. Two invitations sent at the same moment
  // both find nothing, and the unique index on `email` is what actually stops the second one.
  let user;

  try {
    user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(randomToken(32)),
      role,
      isActive: true,
    });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) return emailTaken();
    throw error;
  }

  const { token } = await issueAuthToken({
    purpose: "invite",
    userId: String(user._id),
    email,
    invitedBy: inviter.id,
  });

  const sent = await sendInvite({
    to: email,
    name,
    invitedBy: inviter.name,
    role: role === "super_admin" ? "a super admin" : "an admin",
    token,
  });

  if (!sent.ok) {
    await User.deleteOne({ _id: user._id }).exec();
    await revokeAuthTokens(String(user._id), "invite");
    return errorState("The invitation could not be sent, so the account was not created.");
  }

  return successState(`Invitation sent to ${email}. The link expires in three days.`);
}

export async function acceptInviteAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = acceptInviteSchema.safeParse({
    token: text(formData, "token"),
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });

  if (!parsed.success) return errorState(INVALID_FORM, fieldErrorsFrom(parsed.error));

  const consumed = await consumeAuthToken("invite", parsed.data.token);
  if (!consumed.ok) return errorState(linkFailureMessage(consumed.reason, "invitation"));

  await User.updateOne(
    { _id: consumed.user._id },
    {
      $set: {
        passwordHash: await hashPassword(parsed.data.password),
        passwordChangedAt: new Date(),
      },
    },
  ).exec();

  redirect(`${LOGIN_PATH}?invited=done`);
}

// --- Password change --------------------------------------------------------

/**
 * Changing your own password from the admin profile.
 *
 * The current password is required even though the session already proves who this is,
 * because a session is what an unattended laptop hands to whoever sits down at it.
 */
export async function changePasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getSessionContext();
  const current = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: text(formData, "currentPassword"),
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });

  if (!parsed.success) return errorState(INVALID_FORM, fieldErrorsFrom(parsed.error));

  await connectToDatabase();
  const user = await User.findById(current.id).select("+passwordHash").exec();

  if (!user) return errorState("That account no longer exists.");

  if (!(await verifyPassword(user.passwordHash, parsed.data.currentPassword))) {
    return errorState("Your current password is not right.", {
      currentPassword: ["Your current password is not right."],
    });
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: await hashPassword(parsed.data.password),
        passwordChangedAt: new Date(),
      },
    },
  ).exec();

  // This session survives, every other one does not. Signing yourself out of the browser you
  // are using to change the password is a poor reward for good security hygiene.
  const revoked = await revokeUserSessions(current.id, context?.sessionId);

  return successState(
    revoked > 0
      ? `Password changed. ${revoked === 1 ? "One other session was" : `${revoked} other sessions were`} signed out.`
      : "Password changed.",
  );
}
