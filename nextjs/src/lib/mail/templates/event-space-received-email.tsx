import { Link, Text } from "@react-email/components";

import { BUSINESS, BUSINESS_ADDRESS_LINE } from "@/content/business";
import { EmailLayout, emailStyles } from "@/lib/mail/templates/email-layout";

/**
 * The acknowledgement after an Event Space enquiry.
 *
 * It repeats the date, the head count and what the room is for, because those three are what
 * the reply depends on and a typo in any of them wastes a round trip.
 *
 * No rate appears here, on the page, or anywhere else. Rates depend on the date, how long
 * the room is needed and the setup, and quoting a figure before those are known would either
 * be wrong or would have to be walked back.
 */

export interface EventSpaceReceivedEmailProps {
  name: string;
  eventType: string;
  /** Already formatted for reading, such as "14 October 2026". */
  preferredDate: string;
  expectedAttendees: number;
  capacity: number;
}

export function EventSpaceReceivedEmail({
  name,
  eventType,
  preferredDate,
  expectedAttendees,
  capacity,
}: EventSpaceReceivedEmailProps) {
  return (
    <EmailLayout preview="Your Event Space enquiry has reached us">
      <Text style={emailStyles.heading}>Your Event Space enquiry</Text>
      <Text style={emailStyles.paragraph}>
        Hello {name}, thank you for asking about the Bitnox Event Space. We will confirm whether the
        room is free on your date and come back with a rate.
      </Text>
      <Text style={summary}>
        What the room is for: {eventType}
        <br />
        Date: {preferredDate}
        <br />
        People expected: {expectedAttendees}
        <br />
        Room capacity: {capacity}
      </Text>
      <Text style={emailStyles.paragraph}>
        Rates depend on the date, how long you need the room and the setup, which is why there is no
        figure on the website. Yours will be in the reply.
      </Text>
      <Text style={emailStyles.small}>{BUSINESS_ADDRESS_LINE}</Text>
      <Text style={emailStyles.small}>
        Call {BUSINESS.phone} if your date is close, or reply to this email.
      </Text>
      <Link href={`mailto:${BUSINESS.email}`} style={emailStyles.link}>
        {BUSINESS.email}
      </Link>
    </EmailLayout>
  );
}

export function eventSpaceReceivedText({
  name,
  eventType,
  preferredDate,
  expectedAttendees,
  capacity,
}: EventSpaceReceivedEmailProps): string {
  return [
    `Hello ${name},`,
    "",
    "Thank you for asking about the Bitnox Event Space. We will confirm whether the room is",
    "free on your date and come back with a rate.",
    "",
    `What the room is for: ${eventType}`,
    `Date: ${preferredDate}`,
    `People expected: ${expectedAttendees}`,
    `Room capacity: ${capacity}`,
    "",
    "Rates depend on the date, how long you need the room and the setup, which is why there",
    "is no figure on the website. Yours will be in the reply.",
    "",
    BUSINESS_ADDRESS_LINE,
    `${BUSINESS.phone} | ${BUSINESS.email}`,
  ].join("\n");
}

const summary = {
  backgroundColor: "#f4f6f8",
  borderLeft: "3px solid #05e4fc",
  borderRadius: "0 8px 8px 0",
  color: "#334155",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 20px",
  padding: "14px 16px",
} as const;
