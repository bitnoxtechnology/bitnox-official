import { z } from "zod";

import { SERVICE_SLUGS } from "@/lib/constants";
import { checkboxField, optionalText, statusField } from "@/lib/validations/content-fields";
import { imageValueSchema, jsonField } from "@/lib/validations/image-schema";

/**
 * A testimonial.
 *
 * The rating is optional and has no default. A star count invented for a quote that did not
 * carry one is fabricated social proof, which the copy standards rule out, so a testimonial
 * with no rating renders without stars rather than with five.
 *
 * `relatedProject` is an id or nothing. The select posts an empty string when nobody chose
 * one, which is not a valid ObjectId, so it becomes `undefined` before it reaches the model.
 */
export const testimonialSchema = z.object({
  clientName: z.string().trim().min(2, "Enter the name").max(160, "That name is too long"),
  position: optionalText(160, "That job title is too long"),
  company: optionalText(160, "That company name is too long"),
  testimonialText: z
    .string()
    .trim()
    .min(30, "A quote of at least thirty characters")
    .max(2000, "Keep the quote under two thousand characters"),
  rating: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(5)])
    .optional()
    .transform((value) => (typeof value === "number" ? value : undefined)),
  image: jsonField(imageValueSchema),
  relatedProject: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  service: z
    .union([z.literal(""), z.enum(SERVICE_SLUGS)])
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: statusField,
  featured: checkboxField,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export type TestimonialInput = z.input<typeof testimonialSchema>;
export type TestimonialData = z.output<typeof testimonialSchema>;
