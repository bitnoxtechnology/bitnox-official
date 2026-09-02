import { Text } from "@react-email/components";

import { EmailLayout, emailStyles } from "@/lib/mail/templates/email-layout";

/**
 * The six-digit sign-in code.
 *
 * The code is the first thing in the body and in the preview text, so it can be read from a
 * notification without opening anything. The warning at the end is the part that matters:
 * somebody receiving this without having tried to sign in has had their password taken.
 */

export interface LoginCodeEmailProps {
  name: string;
  code: string;
  minutes: number;
}

export function LoginCodeEmail({ name, code, minutes }: LoginCodeEmailProps) {
  return (
    <EmailLayout preview={`${code} is your Bitnox sign-in code`}>
      <Text style={emailStyles.heading}>Your sign-in code</Text>
      <Text style={emailStyles.paragraph}>
        Hello {name}, use this code to finish signing in to the Bitnox admin.
      </Text>
      <Text style={emailStyles.code}>{code}</Text>
      <Text style={emailStyles.small}>
        The code expires in {minutes} minutes and works once. After five wrong attempts it stops
        working and you will need a new one.
      </Text>
      <Text style={emailStyles.small}>
        If you did not try to sign in, someone else has your password. Change it now from the
        sign-in page.
      </Text>
    </EmailLayout>
  );
}

export function loginCodeText({ name, code, minutes }: LoginCodeEmailProps): string {
  return [
    `Hello ${name},`,
    "",
    `Your Bitnox admin sign-in code is ${code}.`,
    `It expires in ${minutes} minutes and works once.`,
    "",
    "If you did not try to sign in, someone else has your password. Change it now.",
  ].join("\n");
}
