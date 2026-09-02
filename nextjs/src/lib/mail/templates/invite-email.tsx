import { Button, Link, Text } from "@react-email/components";

import { EmailLayout, emailStyles } from "@/lib/mail/templates/email-layout";

/**
 * The invitation to an admin account.
 *
 * The link is the only way the account gets a password. Nobody, including the super admin who
 * sent the invitation, sets one on the invitee's behalf.
 */

export interface InviteEmailProps {
  name: string;
  invitedBy: string;
  role: string;
  url: string;
  hours: number;
}

export function InviteEmail({ name, invitedBy, role, url, hours }: InviteEmailProps) {
  return (
    <EmailLayout preview="You have been invited to the Bitnox admin">
      <Text style={emailStyles.heading}>You have an admin account</Text>
      <Text style={emailStyles.paragraph}>
        Hello {name}, {invitedBy} has invited you to the Bitnox admin as {role}. Choose a password
        to finish setting up the account.
      </Text>
      <Text style={{ margin: "0 0 20px" }}>
        <Button href={url} style={emailStyles.button}>
          Set your password
        </Button>
      </Text>
      <Text style={emailStyles.small}>
        The link works once and expires in {hours} hours. If it has expired, ask {invitedBy} to send
        another.
      </Text>
      <Text style={emailStyles.small}>If the button does not work, copy this link:</Text>
      <Link href={url} style={emailStyles.link}>
        {url}
      </Link>
    </EmailLayout>
  );
}

export function inviteText({ name, invitedBy, role, url, hours }: InviteEmailProps): string {
  return [
    `Hello ${name},`,
    "",
    `${invitedBy} has invited you to the Bitnox admin as ${role}.`,
    "Choose a password to finish setting up the account:",
    url,
    "",
    `The link works once and expires in ${hours} hours.`,
  ].join("\n");
}
