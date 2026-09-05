import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/content/business";
import type { SiteSettingsDTO } from "@/lib/dto";
import { clientEnv } from "@/lib/env";
import { absoluteImageUrl } from "@/lib/urls";

/**
 * The Event Space as a place that can be booked.
 *
 * One node typed as both `EventVenue` and `LocalBusiness` rather than two blocks describing
 * the same room. `EventVenue` is what carries `maximumAttendeeCapacity`, which is the fact
 * this page exists to state; `LocalBusiness` is what makes the address, the phone number and
 * the opening hours eligible for the local results the page is built to appear in. Splitting
 * them would put the same address on the page twice under two identifiers and leave a search
 * engine to work out that they are one room.
 *
 * The address is the NAP from `src/content/business.ts`, which is the only copy of it. It
 * matches the Google Business Profile character for character, and a difference between the
 * two is exactly what weakens the signal this markup is for.
 *
 * No `priceRange` and no `offers`. Nothing on this site publishes a rate, the enquiry form is
 * the pricing mechanism, and price markup that guesses is worse than absent markup: it is
 * shown to somebody who then arrives with a figure we never quoted.
 *
 * `openingHoursSpecification` is emitted only when the hours are in `SiteSettings`, for the
 * same reason. Invented hours in structured data would contradict the Google Business
 * Profile, and contradicting it is worse than saying nothing.
 */

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function EventVenueSchema({
  capacity,
  amenities,
  images,
  openingHours,
}: {
  capacity: number;
  amenities: readonly string[];
  /** Gallery URLs, relative or absolute. Made absolute here. */
  images: readonly string[];
  openingHours: readonly SiteSettingsDTO["openingHours"][number][];
}) {
  const url = `${clientEnv.NEXT_PUBLIC_SITE_URL}/event-space`;

  const openNow = openingHours.filter((hours) => !hours.closed);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["EventVenue", "LocalBusiness"],
        "@id": `${url}#venue`,
        name: `${BUSINESS.shortName} Event Space`,
        description: `A ${capacity}-capacity Event Space in Oke-Ilewo, Abeokuta, booked for conferences, meetings, workshops, tech gatherings, seminars and training.`,
        url,
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        maximumAttendeeCapacity: capacity,
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.streetAddress,
          addressLocality: BUSINESS.locality,
          addressRegion: BUSINESS.region,
          addressCountry: BUSINESS.countryCode,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: BUSINESS.latitude,
          longitude: BUSINESS.longitude,
        },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${BUSINESS.latitude},${BUSINESS.longitude}`,
        amenityFeature: amenities.map((amenity) => ({
          "@type": "LocationFeatureSpecification",
          name: amenity,
          value: true,
        })),
        ...(images.length > 0 ? { image: images.map(absoluteImageUrl) } : {}),
        ...(openNow.length > 0
          ? {
              openingHoursSpecification: openNow.map((hours) => ({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: WEEKDAYS[hours.dayOfWeek - 1],
                opens: hours.opens,
                closes: hours.closes,
              })),
            }
          : {}),
        parentOrganization: {
          "@type": "Organization",
          "@id": `${clientEnv.NEXT_PUBLIC_SITE_URL}#organization`,
          name: BUSINESS.legalName,
          url: clientEnv.NEXT_PUBLIC_SITE_URL,
        },
        // The room is inside the premises described on the contact page. Naming that node is
        // what stops one street address appearing in three blocks as three businesses.
        containedInPlace: { "@id": `${clientEnv.NEXT_PUBLIC_SITE_URL}#localbusiness` },
      }}
    />
  );
}
