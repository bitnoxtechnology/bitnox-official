import { z } from "zod";

/**
 * The shape an image takes in a form.
 *
 * Every image field on this site is an object with required alt text, never a URL string.
 * Image SEO and screen readers both depend on alt text, and a bare string field has nowhere
 * to put it, which is how the legacy `images: string[]` columns ended up with none at all.
 *
 * The upload components put their value into the form as one hidden input holding JSON,
 * rather than as a spread of `images[0][url]` keys. `FormData` has no nested structure, so
 * the alternative is a naming convention that every action then has to reassemble by hand.
 */

export const imageValueSchema = z.object({
  url: z.url("That image did not upload correctly"),
  alt: z
    .string()
    .trim()
    .min(3, "Describe the image, so it works in search and for screen readers")
    .max(300, "Keep the description under three hundred characters"),
  caption: z
    .string()
    .trim()
    .max(500, "That caption is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
  sortOrder: z.number().int().min(0).default(0),
});

export type ImageValue = z.infer<typeof imageValueSchema>;

export const imageListSchema = z.array(imageValueSchema).max(60, "That is too many images");

/**
 * Reads one of the hidden JSON inputs.
 *
 * A field that is absent or empty becomes `undefined` rather than an error, because "no
 * cover image" is a legitimate state for most of these. Malformed JSON is an error, because
 * it means the input was tampered with or the component wrote something it should not have.
 */
export function jsonField<T extends z.ZodType>(schema: T, fallback?: z.input<T>) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value || value.trim() === "") return fallback;

      try {
        return JSON.parse(value) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "That value could not be read" });
        return z.NEVER;
      }
    })
    .pipe(schema.optional());
}
