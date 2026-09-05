"use server";

import {
  errorState,
  fail,
  ok,
  successState,
  text,
  toActionState,
  validate,
  type ActionState,
} from "@/lib/actions/action-state";
import { withAuth } from "@/lib/actions/with-auth";
import { requestMetadata } from "@/lib/auth/cookies";
import { enforceRateLimits, RATE_LIMITS, retryAfterMessage } from "@/lib/auth/rate-limit";
import { EVENT_SPACE_CAPACITY, type EnquiryStatus } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import {
  sendContactAcknowledgement,
  sendEnquiryNotification,
  sendEventSpaceAcknowledgement,
} from "@/lib/mail/site-mail";
import { enquiryStatusSchema, idSchema } from "@/lib/validations/admin-schema";
import { contactEnquirySchema, eventSpaceEnquirySchema } from "@/lib/validations/enquiry-schema";
import { checkSpamGuard, spamMessage } from "@/lib/validations/spam-guard";
import { Enquiry } from "@/models";

/**
 * The enquiry forms and the inbox they land in.
 *
 * The two submission actions are public, so they assume the caller is hostile until the spam
 * guard and the rate limiter have had their say. The admin actions at the foot of the file
 * are guarded by `withAuth`, and the two halves live together because they are one domain:
 * the shape an enquiry is written in is the shape the inbox reads back.
 *
 * The enquiry is written before either email is sent, and neither email can fail the
 * submission: `sendMail` returns a result rather than throwing, and a booking request that is
 * safely in the database should not report failure to the person who sent it because a mail
 * provider was slow. The office still has it, and the acknowledgement is a courtesy.
 *
 * No cache tag is revalidated here. An enquiry changes nothing a public page renders.
 */

const CONTACT_CONFIRMED =
  "Thank you, your message is with us. We read every enquiry and reply within one to two working days, usually with a question or two before a number.";

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

/**
 * The general contact form.
 *
 * The same shape as the Event Space action above and deliberately so: spam guard, shared Zod
 * schema, rate limit, write, then two emails that cannot fail the submission. What differs is
 * that this one asks for less. A contact form is the first thing somebody sends before they
 * know what they need, and every field beyond the four here is a reason to close the tab.
 *
 * The subject is optional and is used as the enquiry's subject when it is given. When it is
 * not, the inbox falls back to a label naming where the message came from, so a list of
 * enquiries never has a blank line in it.
 */
export async function contactEnquiryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = checkSpamGuard(formData);
  if (!guard.ok) return errorState(spamMessage(guard.reason));

  const parsed = validate(contactEnquirySchema, {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    subject: text(formData, "subject"),
    message: text(formData, "message"),
    source: text(formData, "source"),
  });

  if (!parsed.ok) return toActionState(parsed);

  const { name, email, phone, subject, message, source } = parsed.data;

  const { ip } = await requestMetadata();

  const limit = await enforceRateLimits([
    [`enquiry:ip:${ip}`, RATE_LIMITS.enquiryPerIp],
    [`enquiry:email:${email}`, RATE_LIMITS.enquiryPerEmail],
  ]);

  if (!limit.allowed) {
    return errorState(
      `You have sent several messages already. ${retryAfterMessage(limit.retryAfterSeconds)} If it is urgent, call the office instead.`,
    );
  }

  await connectToDatabase();

  const enquiry = await Enquiry.create({
    type: "contact",
    status: "new",
    name,
    email,
    phone,
    subject,
    message,
    source,
  });

  await Promise.all([
    sendContactAcknowledgement({ to: email, name, subject, message }),
    sendEnquiryNotification({
      heading: "New enquiry",
      subject: subject ? `Enquiry: ${subject}` : `Enquiry from ${name}`,
      name,
      email,
      phone,
      details: subject ? [{ label: "Subject", value: subject }] : [],
      message,
      enquiryId: String(enquiry._id),
    }),
  ]);

  return successState(CONTACT_CONFIRMED);
}

// --- The admin inbox --------------------------------------------------------

/**
 * The other half of this domain: what happens to an enquiry after it arrives.
 *
 * Guarded by wrapping rather than by remembering, like every other admin action. Nothing here
 * revalidates a cache tag, because an enquiry changes nothing a public page renders.
 */

/**
 * New, read, responded.
 *
 * Three states rather than a "done" checkbox, because the middle one is the useful one: it
 * separates a message somebody has looked at from one that has actually been answered, which
 * is the difference between an inbox and a pile.
 */
export const setEnquiryStatusAction = withAuth<[string, EnquiryStatus], { status: EnquiryStatus }>(
  async (_user, id, status) => {
    const parsed = validate(enquiryStatusSchema, { id, status });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const enquiry = await Enquiry.findByIdAndUpdate(
      parsed.data.id,
      { $set: { status: parsed.data.status } },
      { new: true },
    )
      .lean()
      .exec();

    if (!enquiry) return fail("That enquiry no longer exists.");

    return ok({ status: enquiry.status });
  },
);

/**
 * Marking one read as it is opened.
 *
 * Separate from the action above and conditional, so that opening a message a colleague has
 * already replied to does not quietly move it back from `responded` to `read`.
 */
export const markEnquiryReadAction = withAuth<[string], { status: EnquiryStatus }>(
  async (_user, id) => {
    const parsed = validate(idSchema, { id });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: parsed.data.id, status: "new" },
      { $set: { status: "read" } },
      { new: true },
    )
      .lean()
      .exec();

    return ok({ status: enquiry?.status ?? "read" });
  },
);

/**
 * Deleted, not archived.
 *
 * An enquiry is somebody's message and the honest reasons to remove one are spam and a
 * request to erase personal data, both of which mean gone rather than hidden. `responded` is
 * where a message that has been dealt with goes.
 */
export const deleteEnquiryAction = withAuth<[string], { id: string }>(async (_user, id) => {
  const parsed = validate(idSchema, { id });
  if (!parsed.ok) return parsed;

  await connectToDatabase();

  const removed = await Enquiry.findByIdAndDelete(parsed.data.id).lean().exec();
  if (!removed) return fail("That enquiry no longer exists.");

  return ok({ id }, "Enquiry deleted.");
});
