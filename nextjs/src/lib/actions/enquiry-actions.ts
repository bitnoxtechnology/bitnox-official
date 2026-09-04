"use server";

import {
  errorState,
  successState,
  text,
  toActionState,
  validate,
  type ActionState,
} from "@/lib/actions/action-state";
import { requestMetadata } from "@/lib/auth/cookies";
import { enforceRateLimits, RATE_LIMITS, retryAfterMessage } from "@/lib/auth/rate-limit";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { sendEnquiryNotification, sendEventSpaceAcknowledgement } from "@/lib/mail/site-mail";
import { eventSpaceEnquirySchema } from "@/lib/validations/enquiry-schema";
import { checkSpamGuard, spamMessage } from "@/lib/validations/spam-guard";
import { Enquiry } from "@/models";

/**
 * The public enquiry forms.
 *
 * Public, so nothing here is behind a guard and everything assumes the caller is hostile
 * until the spam guard and the rate limiter have had their say. The admin side of the inbox,
 * which needs `requireUser()`, is built with the rest of the admin.
 *
 * The enquiry is written before either email is sent, and neither email can fail the
 * submission: `sendMail` returns a result rather than throwing, and a booking request that is
 * safely in the database should not report failure to the person who sent it because a mail
 * provider was slow. The office still has it, and the acknowledgement is a courtesy.
 *
 * No cache tag is revalidated here. An enquiry changes nothing a public page renders.
 */

const CONFIRMED =
  "Your enquiry is with us. We will confirm whether the room is free on that date and come back with a rate, usually within one working day.";

/**
 * The Event Space booking enquiry.
 *
 * This form is the pricing mechanism for the whole page, since no rate is published
 * anywhere, so the failure cases matter more here than on an ordinary contact form. Every
 * one of them returns a message that says what to do next rather than a bare rejection.
 */
export async function eventSpaceEnquiryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = checkSpamGuard(formData);
  if (!guard.ok) return errorState(spamMessage(guard.reason));

  const parsed = validate(eventSpaceEnquirySchema, {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    eventType: text(formData, "eventType"),
    preferredDate: text(formData, "preferredDate"),
    expectedAttendees: text(formData, "expectedAttendees"),
    message: text(formData, "message"),
    source: text(formData, "source"),
  });

  if (!parsed.ok) return toActionState(parsed);

  const { name, email, phone, eventType, preferredDate, expectedAttendees, message, source } =
    parsed.data;

  const { ip } = await requestMetadata();

  const limit = await enforceRateLimits([
    [`enquiry:ip:${ip}`, RATE_LIMITS.enquiryPerIp],
    [`enquiry:email:${email}`, RATE_LIMITS.enquiryPerEmail],
  ]);

  if (!limit.allowed) {
    return errorState(
      `You have sent several enquiries already. ${retryAfterMessage(limit.retryAfterSeconds)} If the date is close, call the office instead.`,
    );
  }

  await connectToDatabase();

  const enquiry = await Enquiry.create({
    type: "event_space",
    status: "new",
    name,
    email,
    phone,
    subject: `Event Space enquiry: ${eventType}`,
    message,
    details: {
      eventType,
      preferredDate: toStoredDate(preferredDate),
      expectedAttendees,
    },
    source,
  });

  const readableDate = formatDay(preferredDate);

  await Promise.all([
    sendEventSpaceAcknowledgement({
      to: email,
      name,
      eventType,
      preferredDate: readableDate,
      expectedAttendees,
      capacity: EVENT_SPACE_CAPACITY,
    }),
    sendEnquiryNotification({
      heading: "Event Space enquiry",
      subject: `Event Space: ${eventType} on ${readableDate}, ${expectedAttendees} people`,
      name,
      email,
      phone,
      details: [
        { label: "What the room is for", value: eventType },
        { label: "Preferred date", value: readableDate },
        { label: "People expected", value: String(expectedAttendees) },
      ],
      message,
      enquiryId: String(enquiry._id),
    }),
  ]);

  return successState(CONFIRMED);
}

/**
 * A `YYYY-MM-DD` from a date input, stored as a `Date`.
 *
 * Midday UTC rather than midnight. The value is a calendar day with no time in it, and
 * midnight UTC is the previous evening in the Americas and the small hours of the next day
 * east of here, so a booking for the 14th would be read back as the 13th or the 15th
 * depending on where the reader is. Midday survives every offset the world uses.
 */
function toStoredDate(day: string): Date {
  return new Date(`${day}T12:00:00.000Z`);
}

/**
 * The same `YYYY-MM-DD` written the way a person reads it, for the two emails.
 *
 * Built from the string's own parts and formatted in UTC, so the day that comes out is the
 * day the visitor picked and not the one their offset happens to land on.
 */
function formatDay(day: string): string {
  const date = toStoredDate(day);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
