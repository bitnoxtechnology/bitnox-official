import { Button, Link, Text } from "@react-email/components";

import { EmailLayout, emailStyles } from "@/lib/mail/templates/email-layout";

/**
 * The internal alert when an enquiry arrives.
 *
 * Written for someone glancing at a phone. The sender's name and what they want are in the
 * subject line and the first two lines of the body, and the reply address is a real
 * `mailto:` link, so answering does not require opening the admin at all.
 *
 * The message is included in full rather than truncated with a "view in dashboard" link,
 * because the point of an alert is to save the trip.
 */

export interface EnquiryNotificationEmailProps {
  /** "New contact enquiry" or "New Event Space enquiry". */
  heading: string;
  name: string;
  email: string;
  phone?: string;
  /** Label and value pairs particular to the enquiry type, already formatted. */
  details: { label: string; value: string }[];
  message: string;
  /** Absolute link into the admin inbox. */
  adminUrl: string;
}

export function EnquiryNotificationEmail({
  heading,
  name,
  email,
  phone,
  details,
  message,
  adminUrl,
}: EnquiryNotificationEmailProps) {
  return (
    <EmailLayout preview={`${heading} from ${name}`}>
      <Text style={emailStyles.heading}>{heading}</Text>
      <Text style={emailStyles.paragraph}>
        {name} got in touch. Reply to{" "}
        <Link href={`mailto:${email}`} style={inlineLink}>
          {email}
        </Link>
        {phone ? `, or call ${phone}.` : "."}
      </Text>
      {details.length > 0 ? (
        <Text style={summary}>
          {details.map((detail, index) => (
            <span key={detail.label}>
              {detail.label}: {detail.value}
              {index < details.length - 1 ? <br /> : null}
            </span>
          ))}
        </Text>
      ) : null}
      <Text style={quote}>{message}</Text>
      <Text style={{ margin: "0 0 8px" }}>
        <Button href={adminUrl} style={emailStyles.button}>
          Open in the admin
        </Button>
      </Text>
    </EmailLayout>
  );
}

export function enquiryNotificationText({
  heading,
  name,
  email,
  phone,
  details,
  message,
  adminUrl,
}: EnquiryNotificationEmailProps): string {
  return [
    heading,
    "",
    `From: ${name} <${email}>`,
    phone ? `Phone: ${phone}` : "",
    ...details.map((detail) => `${detail.label}: ${detail.value}`),
    "",
    message,
    "",
    adminUrl,
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");
}

const inlineLink = { color: "#0369a1", textDecoration: "underline" } as const;

const summary = {
  backgroundColor: "#f4f6f8",
  borderRadius: "8px",
  color: "#334155",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
  padding: "12px 16px",
} as const;

const quote = {
  borderLeft: "3px solid #05e4fc",
  color: "#0a0a0a",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 24px",
  padding: "2px 0 2px 16px",
  whiteSpace: "pre-wrap",
} as const;
