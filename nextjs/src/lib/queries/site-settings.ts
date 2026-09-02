import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { toSiteSettings, type SiteSettingsDTO } from "@/lib/dto";
import { SiteSettings, type ISiteSettings } from "@/models";

/**
 * The settings singleton.
 *
 * Returns null on a database that has not been seeded yet, rather than throwing. Every
 * caller has a sensible fallback, usually the constant in `src/content/business.ts` that
 * seeded the document in the first place, and a footer that renders the address from the
 * constant is a better outcome than a 500 on every page.
 */
export async function getSiteSettings(): Promise<SiteSettingsDTO | null> {
  "use cache";
  cacheTag(CACHE_TAGS.siteSettings);
  cacheLife("max");

  await connectToDatabase();

  const settings = await SiteSettings.findOne({ key: "site" }).lean<ISiteSettings | null>().exec();

  return settings ? toSiteSettings(settings) : null;
}
