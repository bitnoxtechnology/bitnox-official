import "server-only";

import { connectForRequest } from "@/lib/queries/admin/shared";

import { toSiteSettings, type SiteSettingsDTO } from "@/lib/dto";
import { SiteSettings, type ISiteSettings } from "@/models";

/**
 * The settings singleton, read fresh.
 *
 * The public read of the same document is cached and tagged, which is correct for a footer
 * rendered on every page. The settings form cannot use it: an admin who saves the phone
 * number and lands back on the form has to see the number they just typed, not the cached
 * one from before the revalidation propagated.
 */
export async function getSiteSettingsForAdmin(): Promise<SiteSettingsDTO | null> {
  await connectForRequest();

  const settings = await SiteSettings.findOne({ key: "site" }).lean<ISiteSettings | null>().exec();

  return settings ? toSiteSettings(settings) : null;
}
