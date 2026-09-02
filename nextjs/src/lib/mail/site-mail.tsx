import "server-only";

import { BUSINESS } from "@/content/business";
import { clientEnv } from "@/lib/env";
import { sendMail, type MailResult } from "@/lib/mail/send";
import {
  EnquiryNotificationEmail,
  enquiryNotificationText,
} from "@/lib/mail/templates/enquiry-notification-email";
import {
  EnquiryReceivedEmail,
  enquiryReceivedText,
} from "@/lib/mail/templates/enquiry-received-email";
import {
  EventSpaceReceivedEmail,
  eventSpaceReceivedText,
} from "@/lib/mail/templates/event-space-received-email";
import {
  NewsletterWelcomeEmail,
  newsletterWelcomeText,
} from "@/lib/mail/templates/newsletter-welcome-email";

/**
 * The emails the public forms send.
 *
 * The auth flows have their own module, `auth-mail.tsx`, because they carry credentials and
 * are worth keeping separate from anything a visitor can trigger.
 *
 * Every enquiry produces two messages: an acknowledgement to the sender and an alert to the
 * office. They are sent in parallel and neither can fail the other, since `sendMail` returns
 * a result rather than throwing. An enquiry that is safely in the database should not report
 * failure to the person who sent it because a mail provider was slow.
 */

function absoluteUrl(path: string): string {
  return `${clientEnv.NEXT_PUBLIC_SITE_URL}${path}`;
}

/** Where internal alerts go. The public address, so it reaches whoever is on the inbox. */
const OFFICE_INBOX = BUSINESS.email;

export async function sendContactAcknowledgement(input: {
  to: string;
  name: string;
  subject?: string;
  message: string;
}): Promise<MailResult> {
  const props = { name: input.name, subject: input.subject, message: input.message };

  return sendMail({
    to: input.to,
    subject: "We have your message",
    react: <EnquiryReceivedEmail {...props} />,
    text: enquiryReceivedText(props),
  });
}

export async function sendEventSpaceAcknowledgement(input: {
  to: string;
  name: string;
  eventType: string;
  preferredDate: string;
  expectedAttendees: number;
  capacity: number;
}): Promise<MailResult> {
  const { to, ...props } = input;

  return sendMail({
    to,
    subject: "Your Event Space enquiry",
    react: <EventSpaceReceivedEmail {...props} />,
    text: eventSpaceReceivedText(props),
  });
}

export async function sendEnquiryNotification(input: {
  heading: string;
  subject: string;
  name: string;
  email: string;
  phone?: string;
  details?: { label: string; value: string }[];
  message: string;
  enquiryId: string;
}): Promise<MailResult> {
  const props = {
    heading: input.heading,
    name: input.name,
    email: input.email,
    phone: input.phone,
    details: input.details ?? [],
    message: input.message,
    adminUrl: absoluteUrl(`/admin/enquiries/${input.enquiryId}`),
  };

  return sendMail({
    to: OFFICE_INBOX,
    subject: input.subject,
    react: <EnquiryNotificationEmail {...props} />,
    text: enquiryNotificationText(props),
    // So that replying in the inbox reaches the enquirer rather than the no-reply address.
    replyTo: input.email,
  });
}

export async function sendNewsletterWelcome(input: {
  to: string;
  unsubscribeToken: string;
}): Promise<MailResult> {
  const props = {
    unsubscribeUrl: absoluteUrl(
      `/newsletter/unsubscribe?token=${encodeURIComponent(input.unsubscribeToken)}`,
    ),
    blogUrl: absoluteUrl("/blog"),
  };

  return sendMail({
    to: input.to,
    subject: "You are on the Bitnox list",
    react: <NewsletterWelcomeEmail {...props} />,
    text: newsletterWelcomeText(props),
  });
}
