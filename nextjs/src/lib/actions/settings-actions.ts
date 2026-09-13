"use server";

import { revalidateTag } from "next/cache";

import {
  ok,
  text,
  toActionState,
  validate,
  type ActionState,
  type FormInput,
} from "@/lib/actions/action-state";
import { withSuperAdmin } from "@/lib/actions/with-auth";
import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validations/site-settings-schema";
import { SiteSettings } from "@/models";

/**
 * The one form on the site whose fields are nested, and the one place that has to know it.
 *
 * `register("nap.phone")` writes that path into the input's `name`, so the browser posts
 * `nap.phone` and a reader that asks for `phone` gets an empty string back. Every required
 * field in the block then failed at once and the screen could not be saved at all, whatever
 * was typed into it. The prefix is stated once per group here rather than spelled into
 * twenty-two separate reads, so it cannot be applied to some of a group and not the rest.
 *
 * The return type is the keys that were actually read, which is what lets the three
 * annotations below do the same job `FormInput` does for the flat forms: a field added to the
 * schema and left out of the list beneath it fails `npm run typecheck` rather than saving
 * empty. What no type can check is the prefix itself, since a wrong key is a perfectly well
 * typed string. That is what the settings test in `scripts/test-actions.ts` is for: it builds
 * its `FormData` with the names the form registers.
 */
function group<TKey extends string>(
  formData: FormData,
  prefix: string,
  keys: readonly TKey[],
): { [K in TKey]: unknown } {
  return Object.fromEntries(keys.map((key) => [key, text(formData, `${prefix}.${key}`)])) as {
    [K in TKey]: unknown;
  };
}

const NAP_FIELDS = [
  "legalName",
  "streetAddress",
  "locality",
  "region",
  "country",
  "countryCode",
  "phone",
  "email",
  "latitude",
  "longitude",
] as const;

const SOCIAL_FIELDS = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "youtube",
  "tiktok",
  "whatsapp",
] as const;

const SISTER_SITE_FIELDS = ["education", "cleaning"] as const;

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
    const nap: FormInput<SiteSettingsInput["nap"]> = group(formData, "nap", NAP_FIELDS);
    const socialLinks: FormInput<SiteSettingsInput["socialLinks"]> = group(
      formData,
      "socialLinks",
      SOCIAL_FIELDS,
    );
    const sisterSites: FormInput<SiteSettingsInput["sisterSites"]> = group(
      formData,
      "sisterSites",
      SISTER_SITE_FIELDS,
    );

    const input: FormInput<SiteSettingsInput> = {
      nap,
      socialLinks,
      sisterSites,
      defaultOgImage: text(formData, "defaultOgImage"),
      gtmId: text(formData, "gtmId"),
    };

    const parsed = validate(siteSettingsSchema, input);

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
