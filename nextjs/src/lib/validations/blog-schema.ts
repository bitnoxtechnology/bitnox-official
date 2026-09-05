import { z } from "zod";

import {
  canonicalUrlField,
  checkboxField,
  dateTimeField,
  optionalText,
  seoDescriptionField,
  seoTitleField,
  slugField,
  statusField,
  tagsField,
  tiptapDocField,
} from "@/lib/validations/content-fields";
import { imageValueSchema, jsonField } from "@/lib/validations/image-schema";

/**
 * A blog post, as the admin form submits it.
 *
 * One schema, two consumers: the react-hook-form resolver in the browser and the server
 * action that re-validates before writing. `readingMinutes` and `contentHtml` are absent on
 * purpose. Both are derived on the server, and a form that could set them would let a post
 * claim a two-minute read on four thousand words.
 *
 * `scheduledFor` is checked against `status` rather than on its own, because a date in the
 * past is fine on a draft and is a mistake on a scheduled post.
 */
export const blogSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(4, "Give the post a title")
      .max(200, "That title is too long for one line"),
    slug: slugField,
    excerpt: z
      .string()
      .trim()
      .min(40, "Write an excerpt of at least forty characters. It is the search snippet.")
      .max(400, "Keep the excerpt under four hundred characters"),
    contentJson: tiptapDocField,
    coverImage: jsonField(imageValueSchema),
    ogImage: jsonField(imageValueSchema),
    status: statusField,
    scheduledFor: dateTimeField,
    tags: tagsField,
    category: optionalText(80, "That category name is too long"),
    seoTitle: seoTitleField,
    seoDescription: seoDescriptionField,
    canonicalUrl: canonicalUrlField,
    featured: checkboxField,
  })
  .refine((value) => value.status !== "scheduled" || value.scheduledFor !== undefined, {
    path: ["scheduledFor"],
    message: "A scheduled post needs a date and time",
  })
  .refine(
    (value) =>
      value.status !== "scheduled" ||
      value.scheduledFor === undefined ||
      value.scheduledFor.getTime() > Date.now(),
    {
      path: ["scheduledFor"],
      message: "That time has already passed. Publish it instead.",
    },
  );

export type BlogInput = z.input<typeof blogSchema>;
export type BlogData = z.output<typeof blogSchema>;

/**
 * A status change on its own, from the row menu in the list.
 *
 * Separate from the schema above because moving a post to `archived` should not require the
 * whole document to come back up to the server and be revalidated. The action still checks
 * that a post being scheduled has a date on it, since the list can set the status without a
 * form beside it to type one into.
 */
export const blogStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: statusField,
});

export type BlogStatusInput = z.infer<typeof blogStatusSchema>;
