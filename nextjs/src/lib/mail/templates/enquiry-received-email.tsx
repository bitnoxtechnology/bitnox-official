import { Link, Text } from "@react-email/components";

import { BUSINESS } from "@/content/business";
import { EmailLayout, emailStyles } from "@/lib/mail/templates/email-layout";

/**
 * The acknowledgement a visitor gets after using the contact form.
 *
 * It does three things and stops: confirms the message arrived, says when to expect a reply,
 * and repeats what was sent so the sender has a copy. No marketing, no links to four other
 * pages, and no promise of a turnaround the office cannot keep.
 *
 * The message is quoted back rather than summarised, because a contact form is the one place
 * a person types something long and then has no record of it.
 */

export interface EnquiryReceivedEmailProps {
  name: string;
  subject?: string;
  message: string;
}

export function EnquiryReceivedEmail({ name, subject, message }: EnquiryReceivedEmailProps) {
  return (
    <EmailLayout preview="We have your message and will reply shortly">
      <Text style={emailStyles.heading}>Thank you, we have your message</Text>
      <Text style={emailStyles.paragraph}>
        Hello {name}, this is confirmation that your message reached Bitnox Technology Solutions.
        Someone reads every enquiry, and you can expect a reply within one to two working days.
      </Text>
      {subject ? <Text style={emailStyles.small}>Subject: {subject}</Text> : null}
      <Text style={quote}>{message}</Text>
      <Text style={emailStyles.small}>
        If it is urgent, call {BUSINESS.phone} or reply to this email.
      </Text>
      <Link href={`mailto:${BUSINESS.email}`} style={emailStyles.link}>
        {BUSINESS.email}
      </Link>
    </EmailLayout>
  );
}

export function enquiryReceivedText({ name, subject, message }: EnquiryReceivedEmailProps): string {
  return [
    `Hello ${name},`,
    "",
    "This is confirmation that your message reached Bitnox Technology Solutions.",
    "Someone reads every enquiry, and you can expect a reply within one to two working days.",
    "",
    subject ? `Subject: ${subject}` : "",
    "What you sent:",
    message,
    "",
    `If it is urgent, call ${BUSINESS.phone} or reply to this email.`,
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");
}

/**
 * The quoted message.
 *
 * `whiteSpace: pre-wrap` keeps the sender's own line breaks, which matters when the message
 * is a numbered list of requirements rather than a paragraph.
 */
const quote = {
  backgroundColor: "#f4f6f8",
  borderLeft: "3px solid #05e4fc",
  borderRadius: "0 8px 8px 0",
  color: "#334155",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
  padding: "14px 16px",
  whiteSpace: "pre-wrap",
} as const;
