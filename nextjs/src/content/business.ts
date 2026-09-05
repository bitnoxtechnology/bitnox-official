/**
 * The business facts, in one place.
 *
 * The address block must match the Google Business Profile character for character. A
 * difference between the two weakens the local ranking signal that the Event Space page
 * depends on, so this is the only copy of it, and the footer, the contact page, the
 * structured data and the SiteSettings seed all read from here.
 */

export const BUSINESS = {
  legalName: "Bitnox Technology Solutions",
  shortName: "Bitnox",
  streetAddress:
    "24 Last Floor, Majek Kembo Plaza, beside Chicken Republic, Lalubu Street, Oke-Ilewo",
  locality: "Abeokuta",
  region: "Ogun State",
  country: "Nigeria",
  countryCode: "NG",
  phone: "+234 813 719 2766",
  email: "info@bitnoxsolution.com",
  latitude: 7.1353256,
  longitude: 3.3390519,
} as const;

/** The address as one line, for the footer and anywhere a single string is wanted. */
export const BUSINESS_ADDRESS_LINE = `${BUSINESS.streetAddress}, ${BUSINESS.locality}, ${BUSINESS.region}, ${BUSINESS.country}`;
