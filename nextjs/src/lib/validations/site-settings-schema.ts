import { z } from "zod";

import { emailField, phoneField } from "@/lib/validations/fields";
import { imageValueSchema, jsonField } from "@/lib/validations/image-schema";

/**
 * Site settings.
 *
 * The values here exist so that a correction to the address or a new social account does not
 * need a deploy. The NAP block is the part that matters most: it has to match the Google
 * Business Profile character for character, because divergence between the two weakens the
 * local ranking signal the Event Space page depends on. That is why every field is required
 * rather than optional, and why the coordinates are numbers with real bounds.
 */

const optionalUrl = z
  .union([z.literal(""), z.url("Enter a full URL, including https://")])
  .optional()
  .transform((value) => (value ? value : undefined));

export const napSchema = z.object({
  legalName: z.string().trim().min(2, "Enter the legal name").max(160, "That name is too long"),
  streetAddress: z
    .string()
    .trim()
    .min(5, "Enter the street address")
    .max(300, "That address is too long"),
  locality: z.string().trim().min(2, "Enter the town or city").max(120, "That is too long"),
  region: z.string().trim().min(2, "Enter the state or region").max(120, "That is too long"),
  country: z.string().trim().min(2, "Enter the country").max(120, "That is too long"),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Use the two-letter country code, such as NG"),
  phone: phoneField,
  email: emailField,
  latitude: z.coerce
    .number({ message: "Enter the latitude" })
    .min(-90, "A latitude is between -90 and 90")
    .max(90, "A latitude is between -90 and 90"),
  longitude: z.coerce
    .number({ message: "Enter the longitude" })
    .min(-180, "A longitude is between -180 and 180")
    .max(180, "A longitude is between -180 and 180"),
});

export const socialLinksSchema = z.object({
  facebook: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  x: optionalUrl,
  youtube: optionalUrl,
  tiktok: optionalUrl,
  whatsapp: optionalUrl,
});

/**
 * The sister sites, required rather than optional.
 *
 * A visitor looking for courses has to reach `edu.bitnoxsolution.com` without hunting, and
 * the link appears in the nav, the hero, a service page, a landing band and the footer. An
 * empty value here would blank all five at once.
 */
export const sisterSitesSchema = z.object({
  education: z.url("Enter the full URL of the education site"),
  cleaning: z.url("Enter the full URL of the cleaning site"),
});

/**
 * The container ID, checked for shape rather than accepted as free text.
 *
 * `next/script` writes it straight into a URL, so a value with a quote in it would be a
 * script injection into every page on the site. `GTM-` followed by alphanumerics is the
 * whole format, and an empty value means the tag is simply not loaded.
 */
export const gtmIdField = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^GTM-[A-Z0-9]{4,12}$/i, "That is not a GTM ID"),
  ])
  .optional()
  .transform((value) => (value ? value.toUpperCase() : undefined));

export const siteSettingsSchema = z.object({
  nap: napSchema,
  socialLinks: socialLinksSchema,
  sisterSites: sisterSitesSchema,
  defaultOgImage: jsonField(imageValueSchema),
  gtmId: gtmIdField,
});

export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
export type SiteSettingsData = z.output<typeof siteSettingsSchema>;
