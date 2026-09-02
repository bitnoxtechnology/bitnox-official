import "server-only";

import { INVITE_TTL_MS, PASSWORD_RESET_TTL_MS } from "@/lib/auth/auth-tokens";
import { OTP_TTL_MS } from "@/lib/auth/otp";
import { clientEnv } from "@/lib/env";
import { sendMail, type MailResult } from "@/lib/mail/send";
import { InviteEmail, inviteText } from "@/lib/mail/templates/invite-email";
import { LoginCodeEmail, loginCodeText } from "@/lib/mail/templates/login-code-email";
import { PasswordResetEmail, passwordResetText } from "@/lib/mail/templates/password-reset-email";

/**
 * The three emails the auth flows send.
 *
 * Each one builds its own link, so the URL shape lives next to the template that shows it
 * rather than in the action that triggers the send.
 */

const minutes = (ms: number) => Math.round(ms / 60_000);
const hours = (ms: number) => Math.round(ms / 3_600_000);

function absoluteUrl(path: string): string {
  return `${clientEnv.NEXT_PUBLIC_SITE_URL}${path}`;
}

export async function sendLoginCode(input: {
  to: string;
  name: string;
  code: string;
}): Promise<MailResult> {
  const props = { name: input.name, code: input.code, minutes: minutes(OTP_TTL_MS) };

  return sendMail({
    to: input.to,
    subject: `${input.code} is your Bitnox sign-in code`,
    react: <LoginCodeEmail {...props} />,
    text: loginCodeText(props),
  });
}

export async function sendInvite(input: {
  to: string;
  name: string;
  invitedBy: string;
  role: string;
  token: string;
}): Promise<MailResult> {
  const props = {
    name: input.name,
    invitedBy: input.invitedBy,
    role: input.role,
    url: absoluteUrl(`/admin/accept-invite?token=${encodeURIComponent(input.token)}`),
    hours: hours(INVITE_TTL_MS),
  };

  return sendMail({
    to: input.to,
    subject: "Your Bitnox admin account",
    react: <InviteEmail {...props} />,
    text: inviteText(props),
  });
}

export async function sendPasswordReset(input: {
  to: string;
  name: string;
  token: string;
}): Promise<MailResult> {
  const props = {
    name: input.name,
    url: absoluteUrl(`/admin/reset-password?token=${encodeURIComponent(input.token)}`),
    minutes: minutes(PASSWORD_RESET_TTL_MS),
  };

  return sendMail({
    to: input.to,
    subject: "Reset your Bitnox admin password",
    react: <PasswordResetEmail {...props} />,
    text: passwordResetText(props),
  });
}
