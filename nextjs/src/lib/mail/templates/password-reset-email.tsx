import { Button, Link, Text } from "@react-email/components";

import { EmailLayout, emailStyles } from "@/lib/mail/templates/email-layout";

/**
 * The password reset link.
 *
 * The closing line matters as much as the link. Somebody who did not ask for this needs to
 * know that ignoring it costs them nothing.
 */

export interface PasswordResetEmailProps {
  name: string;
  url: string;
  minutes: number;
}

export function PasswordResetEmail({ name, url, minutes }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your Bitnox admin password">
      <Text style={emailStyles.heading}>Reset your password</Text>
      <Text style={emailStyles.paragraph}>
        Hello {name}, use the link below to choose a new password for the Bitnox admin.
      </Text>
      <Text style={{ margin: "0 0 20px" }}>
        <Button href={url} style={emailStyles.button}>
          Choose a new password
        </Button>
      </Text>
      <Text style={emailStyles.small}>
        The link works once and expires in {minutes} minutes. Setting a new password signs out every
        other device.
      </Text>
      <Text style={emailStyles.small}>
        If you did not ask for this, ignore it. Your password stays as it is.
      </Text>
      <Link href={url} style={emailStyles.link}>
        {url}
      </Link>
    </EmailLayout>
  );
}

export function passwordResetText({ name, url, minutes }: PasswordResetEmailProps): string {
  return [
    `Hello ${name},`,
    "",
    "Use this link to choose a new password for the Bitnox admin:",
    url,
    "",
    `The link works once and expires in ${minutes} minutes.`,
    "If you did not ask for this, ignore it. Your password stays as it is.",
  ].join("\n");
}
