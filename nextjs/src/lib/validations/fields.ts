import { z } from "zod";

/**
 * Field primitives shared by more than one schema.
 *
 * Not a generic form builder. These are the four or five fields that genuinely repeat
 * across the sign-in, contact, Event Space and newsletter forms, defined once so that an
 * email address is accepted and rejected on the same terms everywhere, and so that the
 * message a visitor reads is the same sentence on every page.
 *
 * Anything used by one form stays in that form's schema, where it can be read next to the
 * thing it validates.
 */

/**
 * Lowercased and trimmed before the format check, so `  Info@Bitnox.com ` and
 * `info@bitnox.com` are the same address to the unique index on the subscriber collection.
 * The length cap is the RFC limit, and it also stops a multi-kilobyte string reaching the
 * mail provider.
 */
export const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .max(254, "That email address is too long")
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const nameField = z
  .string()
  .trim()
  .min(2, "Enter your name")
  .max(120, "That name is too long");

/**
 * Deliberately loose.
 *
 * Numbers arrive as `08137192766`, `+234 813 719 2766` and `(0813) 719-2766`, all of which
 * are the same number and all of which a person can dial. A strict pattern would reject the
 * UK numbers this site also expects, so this checks that the value is plausibly a phone
 * number and leaves the formatting alone.
 */
export const phoneField = z
  .string()
  .trim()
  .min(7, "That phone number looks too short")
  .max(32, "That phone number looks too long")
  .regex(/^[\d+()\-.\s]+$/, "Use digits, spaces and the + sign only");

export const optionalPhoneField = z
  .union([z.literal(""), phoneField])
  .optional()
  .transform((value) => (value ? value : undefined));

export const messageField = z
  .string()
  .trim()
  .min(20, "Tell us a little more, at least twenty characters")
  .max(4000, "Keep it under four thousand characters");

export const subjectField = z
  .string()
  .trim()
  .max(160, "That subject line is too long")
  .optional()
  .transform((value) => (value ? value : undefined));

/**
 * Where the submission came from, recorded on the enquiry so the inbox can tell a contact
 * page message from an Event Space one at a glance. Never shown to the sender, and never
 * trusted for anything beyond a label.
 */
export const sourceField = z
  .string()
  .trim()
  .max(80)
  .optional()
  .transform((value) => (value ? value : undefined));
