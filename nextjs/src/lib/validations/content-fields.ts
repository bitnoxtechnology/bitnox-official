import { z } from "zod";

import { PUBLISH_STATUSES } from "@/lib/constants";
import { slugify } from "@/lib/slug";

/**
 * The fields the publishable collections share.
 *
 * Blog posts and portfolio projects are different things, but they are published the same
 * way: a slug that must not change under a corrected heading, four states rather than a
 * boolean, a tag list typed as one line, and the two SEO overrides. Writing those four
 * definitions twice is how a title cap of seventy characters ends up as sixty on one screen.
 *
 * Anything that belongs to one collection stays in that collection's schema, next to what it
 * validates.
 */

/**
 * Optional, and normalised rather than rejected.
 *
 * An admin correcting a slug types what they mean rather than what a URL allows, so
 * `A Better Title!` becomes `a-better-title` instead of an error message. Left empty, the
 * model derives it from the title on create and leaves it alone on every save after that.
 */
export const slugField = z
  .string()
  .trim()
  .max(200, "That slug is too long")
  .optional()
  .transform((value) => {
    const slug = value ? slugify(value) : "";
    return slug ? slug : undefined;
  });

export const statusField = z.enum(PUBLISH_STATUSES, { message: "Choose a status" });

/**
 * A comma-separated line, because that is how a writer types a tag list.
 *
 * Lowercased and de-duplicated here rather than in the model, so `SEO, seo` cannot produce
 * two tag archive pages that are the same page.
 */
export const tagsField = z
  .string()
  .trim()
  .max(400, "That is a lot of tags")
  .optional()
  .transform((value) =>
    value
      ? [
          ...new Set(
            value
              .split(",")
              .map((tag) => tag.trim().toLowerCase())
              .filter(Boolean),
          ),
        ].slice(0, 12)
      : [],
  );

/** An optional single-line text field: blank arrives as `undefined`, never as `""`. */
export function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value ? value : undefined));
}

/**
 * The two SEO overrides, capped at what a search result actually shows.
 *
 * Seventy characters and a hundred and eighty are where Google truncates in practice. The
 * caps are enforced rather than suggested, because a title that is cut mid-word in the
 * result is worse than one written to fit.
 */
export const seoTitleField = optionalText(70, "Keep the SEO title under seventy characters");
export const seoDescriptionField = optionalText(
  180,
  "Keep the meta description under a hundred and eighty characters",
);

export const canonicalUrlField = z
  .union([z.literal(""), z.url("Enter a full URL, including https://")])
  .optional()
  .transform((value) => (value ? value : undefined));

/** A checkbox in `FormData` is the string `"on"` when ticked and absent when not. */
export const checkboxField = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .optional()
  .transform((value) => value === "on" || value === "true");

/**
 * A `datetime-local` value, kept as the string the browser produced until the last moment.
 *
 * Parsed here into a `Date` because that is what the model stores, and left undefined when
 * blank, which is the state a draft with no schedule is in.
 */
export const dateTimeField = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "That is not a date this site can read" });
      return z.NEVER;
    }

    return parsed;
  });

/**
 * The Tiptap document, as JSON in one hidden input.
 *
 * Validated only as far as "it is an object with a `doc` type". The schema below it is the
 * extension list in `src/lib/blog/extensions.ts`, and re-describing thirty node shapes in Zod
 * would be a second schema that drifts from the first. What matters here is that the value
 * parses, is a document, and is small enough not to be an attack, and the renderer refuses
 * anything it cannot make sense of.
 */
export const tiptapDocField = z
  .string()
  .max(2_000_000, "That post is too long to save")
  .transform((value, ctx) => {
    try {
      const parsed: unknown = JSON.parse(value);

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        (parsed as { type?: unknown }).type !== "doc"
      ) {
        ctx.addIssue({ code: "custom", message: "The editor content could not be read" });
        return z.NEVER;
      }

      return parsed as Record<string, unknown>;
    } catch {
      ctx.addIssue({ code: "custom", message: "The editor content could not be read" });
      return z.NEVER;
    }
  });
