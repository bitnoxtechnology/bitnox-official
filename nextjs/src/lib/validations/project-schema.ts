import { z } from "zod";

import { SERVICE_SLUGS } from "@/lib/constants";
import {
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
import { imageListSchema, imageValueSchema, jsonField } from "@/lib/validations/image-schema";

/**
 * A portfolio project.
 *
 * The same publishing shape as a blog post, with the fields a case study needs on top: which
 * services the work belongs to, what it was built with, and the gallery.
 *
 * `services` arrives as repeated `FormData` entries under one key, which is how a group of
 * checkboxes posts. The array is what decides whether the project appears on a service page,
 * so an unrecognised slug is rejected rather than dropped.
 */
export const projectSchema = z.object({
  title: z.string().trim().min(3, "Give the project a title").max(200, "That title is too long"),
  slug: slugField,
  summary: z
    .string()
    .trim()
    .min(40, "Write a summary of at least forty characters. It is the card and the snippet.")
    .max(400, "Keep the summary under four hundred characters"),
  contentJson: tiptapDocField,
  coverImage: jsonField(imageValueSchema),
  images: jsonField(imageListSchema, []),
  ogImage: jsonField(imageValueSchema),
  client: optionalText(160, "That client name is too long"),
  industry: optionalText(120, "That industry name is too long"),
  services: z.array(z.enum(SERVICE_SLUGS)).max(SERVICE_SLUGS.length).default([]),
  techStack: tagsField,
  completedAt: dateTimeField,
  liveUrl: z
    .union([z.literal(""), z.url("Enter a full URL, including https://")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  repoUrl: z
    .union([z.literal(""), z.url("Enter a full URL, including https://")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  tags: tagsField,
  status: statusField,
  featured: checkboxField,
  order: z.coerce.number().int().min(0).max(9999).default(0),
  seoTitle: seoTitleField,
  seoDescription: seoDescriptionField,
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectData = z.output<typeof projectSchema>;
