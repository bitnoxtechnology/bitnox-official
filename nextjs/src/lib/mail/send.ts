import "server-only";

import type { ReactElement } from "react";

import { serverEnv } from "@/lib/env";
import { resend } from "@/lib/mail/client";

/**
 * One place every transactional email goes through.
 *
 * Sending never throws. A mail provider having a bad afternoon should not turn a password
 * reset into a stack trace, and the caller decides what to tell the user, which is usually
 * the same thing whether the send worked or not.
 *
 * Every message carries a plain-text alternative. Some clients refuse to render HTML, and a
 * sign-in code nobody can read is worse than no code at all.
 */

export interface MailMessage {
  to: string;
  subject: string;
  react: ReactElement;
  text: string;
}

export interface MailResult {
  ok: boolean;
  error?: string;
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  try {
    const { error } = await resend().emails.send({
      from: serverEnv.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      react: message.react,
      text: message.text,
    });

    if (error) {
      reportFailure(message, error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "Unknown mail error";
    reportFailure(message, reason);
    return { ok: false, error: reason };
  }
}

/**
 * A failed send is logged with its plain-text body in development only.
 *
 * Without it, a developer whose Resend key is not yet set has no way to reach the sign-in
 * code and cannot get into the admin at all. In production the body is deliberately absent
 * from the log, because it contains the credential.
 */
function reportFailure(message: MailMessage, reason: string): void {
  if (process.env.NODE_ENV === "production") {
    console.error(`[mail] failed to send "${message.subject}" to ${message.to}: ${reason}`);
    return;
  }

  console.warn(
    [
      `[mail] send failed (${reason}). Printing the message instead.`,
      `  to:      ${message.to}`,
      `  subject: ${message.subject}`,
      ...message.text.split("\n").map((line) => `  ${line}`),
    ].join("\n"),
  );
}
