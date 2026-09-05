"use server";

import { revalidateTag } from "next/cache";

import { ok, text, toActionState, validate, type ActionState } from "@/lib/actions/action-state";
import { withSuperAdmin } from "@/lib/actions/with-auth";
import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { siteSettingsSchema } from "@/lib/validations/site-settings-schema";
import { SiteSettings } from "@/models";

/**
 * Site settings.
 *
 * Super admins only. The values here are read by every page on the site, so a mistake in the
 * address is a mistake in the footer, the contact page and the structured data at once. That
 * is also why the NAP block is validated as strictly as it is: it has to match the Google
 * Business Profile character for character, and divergence between the two weakens the local
 * ranking signal that the Event Space page depends on.
 *
 * `upsert` covers the database that has not been seeded, so an admin who reaches this screen
 * before `db:seed` has run creates the singleton by saving rather than seeing a failure with
 * nothing they can do about it.
 *
 * One tag, invalidated at the end. Every public page reads these values through the cached
 * settings query, so without the call a corrected phone number would not appear anywhere
 * until the next deployment.
 */
export const saveSiteSettingsAction = withSuperAdmin<[FormData], { ok: true }>(
  async (_user, formData) => {
    const parsed = validate(siteSettingsSchema, {
      nap: {
        legalName: text(formData, "legalName"),
        streetAddress: text(formData, "streetAddress"),
        locality: text(formData, "locality"),
        region: text(formData, "region"),
        country: text(formData, "country"),
        countryCode: text(formData, "countryCode"),
        phone: text(formData, "phone"),
        email: text(formData, "email"),
        latitude: text(formData, "latitude"),
        longitude: text(formData, "longitude"),
      },
      socialLinks: {
        facebook: text(formData, "facebook"),
        instagram: text(formData, "instagram"),
        linkedin: text(formData, "linkedin"),
        x: text(formData, "x"),
        youtube: text(formData, "youtube"),
        tiktok: text(formData, "tiktok"),
        whatsapp: text(formData, "whatsapp"),
      },
      sisterSites: {
        education: text(formData, "education"),
        cleaning: text(formData, "cleaning"),
      },
      defaultOgImage: text(formData, "defaultOgImage"),
      gtmId: text(formData, "gtmId"),
    });

    if (!parsed.ok) return parsed;

    await connectToDatabase();

    await SiteSettings.updateOne(
      { key: "site" },
      {
        $set: {
          nap: parsed.data.nap,
          socialLinks: parsed.data.socialLinks,
          sisterSites: parsed.data.sisterSites,
          ...(parsed.data.defaultOgImage ? { defaultOgImage: parsed.data.defaultOgImage } : {}),
          ...(parsed.data.gtmId ? { gtmId: parsed.data.gtmId } : {}),
        },
        // A cleared field has to actually leave the document. `$set` of `undefined` is a
        // no-op in Mongo, so without this a Tag Manager container removed on the form would
        // keep loading on every page.
        $unset: {
          ...(parsed.data.defaultOgImage ? {} : { defaultOgImage: "" }),
          ...(parsed.data.gtmId ? {} : { gtmId: "" }),
        },
      },
      { upsert: true },
    ).exec();

    revalidateTag(CACHE_TAGS.siteSettings, "max");

    return ok({ ok: true as const }, "Settings saved.");
  },
);

export async function saveSiteSettingsFormAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return toActionState(await saveSiteSettingsAction(formData), "Settings saved.");
}
