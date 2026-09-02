import { z } from "zod";

import {
  emailField,
  messageField,
  nameField,
  optionalPhoneField,
  sourceField,
  subjectField,
} from "@/lib/validations/fields";

/**
 * The two enquiry forms.
 *
 * They write to one `Enquiry` collection with a `type` discriminator, so the admin inbox is
 * one screen rather than two, and a general question that arrives through the Event Space
 * page is not lost in a separate list.
 *
 * The Event Space schema adds the three things that decide whether a booking is possible at
 * all: the date, the number of people and what the room is for. Asking for them here means
 * the first reply can be an answer rather than three more questions.
 */

export const contactEnquirySchema = z.object({
  name: nameField,
  email: emailField,
  phone: optionalPhoneField,
  subject: subjectField,
  message: messageField,
  source: sourceField,
});

export type ContactEnquiryInput = z.input<typeof contactEnquirySchema>;
export type ContactEnquiryData = z.output<typeof contactEnquirySchema>;

/**
 * What the room is being used for.
 *
 * A fixed list rather than free text, because it is the field that decides the setup, and
 * because "Event Space" attracts wedding and party enquiries that this room is not for. The
 * options say what it is for without a line of copy having to.
 */
export const EVENT_TYPES = [
  "Conference",
  "Meeting",
  "Workshop",
  "Training or class",
  "Tech gathering",
  "Product launch",
  "Other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/**
 * A date on today or after it, in the browser's own `YYYY-MM-DD` form.
 *
 * Compared as a plain string rather than parsed into a `Date`, so a visitor in London and
 * the server in another timezone agree on what "today" is. `new Date("2026-09-02")` is
 * midnight UTC, which is yesterday evening in some places and would reject a booking made
 * for this afternoon.
 */
const preferredDateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date")
  .refine((value) => value >= new Date().toISOString().slice(0, 10), "Choose a date in the future");

export const eventSpaceEnquirySchema = z.object({
  name: nameField,
  email: emailField,
  phone: optionalPhoneField,
  eventType: z.enum(EVENT_TYPES, { message: "Choose what the room is for" }),
  preferredDate: preferredDateField,
  expectedAttendees: z.coerce
    .number({ message: "Enter how many people are coming" })
    .int("Enter a whole number")
    .min(1, "Enter at least one person")
    .max(500, "Enter a realistic number of people"),
  message: messageField,
  source: sourceField,
});

export type EventSpaceEnquiryInput = z.input<typeof eventSpaceEnquirySchema>;
export type EventSpaceEnquiryData = z.output<typeof eventSpaceEnquirySchema>;
