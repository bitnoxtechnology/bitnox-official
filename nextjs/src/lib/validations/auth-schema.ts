import { z } from "zod";

import { MIN_PASSWORD_LENGTH, USER_ROLES } from "@/lib/constants";
import { emailField } from "@/lib/validations/fields";

/**
 * One schema per form, two consumers.
 *
 * Each schema below is handed to the react-hook-form resolver on the client and used again
 * inside the server action. The client pass is there to give a fast, field-level message. The
 * server pass is the one that decides anything, because a form post can be made without ever
 * loading the form.
 */

/**
 * The same address rules the public forms use.
 *
 * Shared rather than restated, so the address an admin is invited with is normalised
 * identically to the one a visitor subscribes with, and the unique index on `email` is
 * comparing like with like.
 */
const email = emailField;

/**
 * Length first, then a token requirement.
 *
 * Twelve characters with a letter and a number rules out the passwords that fall to a
 * dictionary in seconds without pushing people towards the unmemorable substitutions that a
 * symbol requirement produces. The upper bound exists because argon2 hashes whatever it is
 * given and a multi-megabyte password is a denial of service.
 */
const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(200, "Use fewer than 200 characters")
  .refine((value) => /[a-z]/i.test(value), "Include at least one letter")
  .refine((value) => /\d/.test(value), "Include at least one number");

/**
 * The two password fields, and the check that they agree.
 *
 * Written as shared pieces rather than a generic wrapper, because a helper that builds the
 * object loses the field names in its type and takes the editor's autocomplete with them.
 */
const passwordPair = { password, confirmPassword: z.string() };

function passwordsMatch(values: { password: string; confirmPassword: string }): boolean {
  return values.password === values.confirmPassword;
}

/** Reported against the confirmation field, which is the one the person should retype. */
const mismatch = {
  message: "The two passwords do not match",
  path: ["confirmPassword"],
};

export const loginSchema = z.object({
  email,
  // Only presence is checked. Applying the strength rules to a sign-in would tell an attacker
  // which stored passwords predate them, and would lock out anyone whose password is older
  // than the policy.
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the six-digit code"),
});

export type OtpInput = z.infer<typeof otpSchema>;

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(120, "That name is too long"),
  email,
  role: z.enum(USER_ROLES, { message: "Choose a role" }),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const acceptInviteSchema = z
  .object({ token: z.string().min(1, "This link is missing its token"), ...passwordPair })
  .refine(passwordsMatch, mismatch);

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export const requestPasswordResetSchema = z.object({ email });

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z
  .object({ token: z.string().min(1, "This link is missing its token"), ...passwordPair })
  .refine(passwordsMatch, mismatch);

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password"), ...passwordPair })
  .refine(passwordsMatch, mismatch)
  .refine((values) => values.currentPassword !== values.password, {
    message: "The new password must be different from the current one",
    path: ["password"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
