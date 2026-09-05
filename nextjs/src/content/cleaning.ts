/**
 * The cleaning overview, as content.
 *
 * Short on purpose. `/cleaning` is a signpost, not a service page: it says that Bitnox offers
 * laundry and cleaning, summarises it in a few lines, and hands off to the subdomain. No
 * pricing, no quote form, no service detail, and no `Service` or `LocalBusiness` markup,
 * because all of that belongs on `cleaning.bitnoxsolution.com` and duplicating it here would
 * put this page in competition with the one it is pointing at.
 *
 * That constraint is what shaped the copy. Everything here is enough to recognise that the
 * right service exists and to click through, and nothing here is enough to substitute for
 * the subdomain. The two most common reasons somebody lands on this page are a search that
 * matched the main domain and a visitor who found "Bitnox Cleaning" in the footer of this
 * site; both want the same thing, which is the way across.
 */

/**
 * Whether `cleaning.bitnoxsolution.com` has been confirmed live.
 *
 * This one boolean decides whether the page emits a canonical pointing at the subdomain. The
 * canonical is what makes the subdomain, rather than this page, accumulate the ranking signal
 * for laundry and cleaning, so it is wanted the moment the subdomain is up.
 *
 * It is wanted only then. A canonical pointing at a URL that does not resolve tells a search
 * engine to prefer a dead address over a working page, which would take this overview out of
 * the index and put nothing in its place. Confirming the subdomain is a Phase 0 item, so
 * until somebody has actually loaded it, this stays false and the page self-canonicalises.
 *
 * Flipping it is a one-line change and the only one needed.
 */
export const CLEANING_SUBDOMAIN_CONFIRMED = false;

export const CLEANING_SEO = {
  title: "Bitnox Cleaning: Laundry and Cleaning Services",
  description:
    "Bitnox also runs a laundry and cleaning service in Abeokuta, for homes and for offices. Details, coverage and booking are on cleaning.bitnoxsolution.com.",
} as const;

export const CLEANING_HERO = {
  eyebrow: "Bitnox Cleaning",
  headline: "Laundry and cleaning,\non its own site.",
  lead: "Bitnox runs a laundry and cleaning arm alongside the technology company. Everything about it, including what it covers and how to book, is on cleaning.bitnoxsolution.com.",
} as const;

/** What the service covers, at the level of detail a signpost needs and no further. */
export const CLEANING_COVERAGE: readonly { title: string; body: string }[] = [
  {
    title: "Laundry",
    body: "Washing, ironing and dry cleaning for households, with collection and delivery in Abeokuta.",
  },
  {
    title: "Home cleaning",
    body: "Regular or one-off cleaning for flats and houses, including deep cleans and post-construction work.",
  },
  {
    title: "Office and commercial",
    body: "Scheduled cleaning for offices, shops and business premises, arranged around your working hours.",
  },
];

export const CLEANING_NOTE =
  "It is the same company and the same office, run by a separate team. Rates, coverage areas and booking are handled on the cleaning site, which is why this page does not quote a figure: the numbers live where they are kept up to date.";
