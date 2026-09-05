import { z } from "zod";

import { imageListSchema, jsonField } from "@/lib/validations/image-schema";

/**
 * The Event Space admin.
 *
 * Two separate things, because they change on different days. The gallery is edited when new
 * photographs arrive, and the room's own details are corrected once a year.
 *
 * No rate, range or "from" figure appears in either. Pricing on this site is on request and
 * the enquiry form is the mechanism, so there is nowhere in the admin to type a price and
 * accidentally publish one.
 */

/**
 * The gallery, posted as one ordered list rather than as a row per image.
 *
 * `isCover` is derived from the chosen index rather than submitted per row, which is what
 * makes "exactly one cover" true by construction instead of by validation. Two rows both
 * claiming to be the cover is not a state this form can produce.
 */
export const eventSpaceGallerySchema = z.object({
  images: jsonField(imageListSchema, []),
  coverIndex: z.coerce.number().int().min(-1).max(59).default(-1),
});

export type EventSpaceGalleryInput = z.input<typeof eventSpaceGallerySchema>;
export type EventSpaceGalleryData = z.output<typeof eventSpaceGallerySchema>;

/**
 * Capacity, amenities and the availability copy.
 *
 * Sixty is the real number and the fallback in `src/lib/constants.ts`, but it is editable
 * because a room can be re-laid out and a hard-coded figure in six components is not.
 *
 * The availability copy says what a visitor can expect: how a date is confirmed, how quickly
 * a reply comes. It is capped at a thousand characters so it stays a paragraph.
 */
export const eventSpaceDetailsSchema = z.object({
  capacity: z.coerce
    .number({ message: "Enter the seated capacity" })
    .int("Enter a whole number")
    .min(1, "The room seats at least one person")
    .max(500, "Enter a realistic capacity"),
  amenities: z
    .string()
    .trim()
    .max(2000, "That is a long list. Keep it to the amenities worth naming.")
    .optional()
    .transform((value) =>
      value
        ? [
            ...new Set(
              value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            ),
          ].slice(0, 30)
        : [],
    ),
  availabilityCopy: z
    .string()
    .trim()
    .max(1000, "Keep this to a paragraph")
    .optional()
    .transform((value) => value ?? ""),
});

export type EventSpaceDetailsInput = z.input<typeof eventSpaceDetailsSchema>;
export type EventSpaceDetailsData = z.output<typeof eventSpaceDetailsSchema>;
