import { z } from "zod";

import { ENQUIRY_STATUSES, ENQUIRY_TYPES, PUBLISH_STATUSES, USER_ROLES } from "@/lib/constants";

/**
 * The small schemas behind the admin's list screens and row actions.
 *
 * None of these is a content form. They are the arguments to a button: change this user's
 * role, mark this enquiry read, show me page three of the drafts. They live together because
 * each is four lines and a file per button would be forty files.
 *
 * The list-query schema is the important one. Search, filter and page all arrive from the
 * URL, where anybody can type anything, and every one of them ends up in a Mongo query.
 * Parsing them here is what stops `?page=-5` becoming a negative skip and `?status=` becoming
 * a filter on a status that does not exist.
 */

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{24}$/i, "That record could not be found");

export const idSchema = z.object({ id: objectId });

/** Shared by every admin list. `all` is a real value, so "no filter" is not a typo. */
export const listQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: z
    .union([z.literal("all"), z.enum(PUBLISH_STATUSES)])
    .optional()
    .transform((value) => (value && value !== "all" ? value : undefined)),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});

export type ListQuery = z.output<typeof listQuerySchema>;

export const enquiryListQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : undefined)),
  type: z
    .union([z.literal("all"), z.enum(ENQUIRY_TYPES)])
    .optional()
    .transform((value) => (value && value !== "all" ? value : undefined)),
  status: z
    .union([z.literal("all"), z.enum(ENQUIRY_STATUSES)])
    .optional()
    .transform((value) => (value && value !== "all" ? value : undefined)),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});

export type EnquiryListQuery = z.output<typeof enquiryListQuerySchema>;

export const subscriberListQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: z
    .union([z.literal("all"), z.literal("subscribed"), z.literal("unsubscribed")])
    .optional()
    .transform((value) => (value && value !== "all" ? value : undefined)),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});

export type SubscriberListQuery = z.output<typeof subscriberListQuerySchema>;

export const enquiryStatusSchema = z.object({
  id: objectId,
  status: z.enum(ENQUIRY_STATUSES, { message: "Choose a status" }),
});

/**
 * A role change and an activation, and nothing else.
 *
 * There is deliberately no field here for another person's password. A super admin can
 * invite, promote, demote and deactivate; setting somebody else's password would mean an
 * account whose credentials two people know, and the invitation and reset links already
 * cover every case where a password needs to change.
 */
export const userRoleSchema = z.object({
  id: objectId,
  role: z.enum(USER_ROLES, { message: "Choose a role" }),
});

export const userActiveSchema = z.object({
  id: objectId,
  isActive: z.union([z.literal("true"), z.literal("false")]).transform((value) => value === "true"),
});

/** Reordering: the ids in their new order, applied as the new `sortOrder` values. */
export const reorderSchema = z.object({
  ids: z.array(objectId).min(1, "Nothing to reorder").max(200, "That is too many rows"),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
