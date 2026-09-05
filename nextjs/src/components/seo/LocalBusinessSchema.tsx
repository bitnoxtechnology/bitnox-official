import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/content/business";
import { EVENT_SPACE_PHOTOS } from "@/content/event-space-media";
import type { SiteSettingsDTO } from "@/lib/dto";
import { clientEnv } from "@/lib/env";
import { absoluteImageUrl, absoluteUrl } from "@/lib/urls";

/**
 * The premises in Abeokuta, on the contact page.
 *
 * This is the node that makes the office eligible for the local results, and the contact page
 * is where it belongs: the page carrying the address, the phone number, the hours and the
 * map is the page whose markup should describe a place.
 *
 * Three nodes now describe Bitnox and they do not overlap. `#organization` is the company,
 * which has no opening hours and trades in two countries. `#localbusiness`, here, is the
 * office you can walk into. `#venue` on the Event Space page is the room inside it that can
 * be booked, and it says so by naming this node as the place that contains it. Without those
 * identifiers a crawler sees the same street address in three blocks and has to guess whether
 * that is one business or three.
 *
 * `image` is a photograph of the premises rather than the logo. Google's guidance for a local
 * business asks for a picture of the place, the logo is an SVG, and a vector wordmark is not
 * a photograph of anywhere. The picture used is the same one the Event Space gallery leads
 * with, which is a real photograph of this address.
 *
 * No `priceRange`. It is the same rule the Event Space markup follows: nothing on this site
 * publishes a rate, and a `priceRange` of "$$" is a guess presented as a fact.
 *
 * The hours are emitted only when they are in `SiteSettings`. Invented hours would contradict
 * the Google Business Profile, and contradicting the profile is worse than saying nothing,
 * because agreement between the two is the signal this markup exists to send.
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

export function LocalBusinessSchema({
  openingHours,
}: {
  openingHours: readonly SiteSettingsDTO["openingHours"][number][];
}) {
  const site = clientEnv.NEXT_PUBLIC_SITE_URL;
  const openNow = openingHours.filter((hours) => !hours.closed);
  const premisesPhoto = EVENT_SPACE_PHOTOS[0];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": `${site}#localbusiness`,
        name: BUSINESS.legalName,
        description:
          "The Bitnox office in Oke-Ilewo, Abeokuta. Software development, web development, IT consulting and technology training, and the Bitnox Event Space.",
        url: site,
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        currenciesAccepted: "NGN",
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
        ...(premisesPhoto ? { image: absoluteImageUrl(premisesPhoto.url) } : {}),
        logo: absoluteUrl("/logo.svg"),
        areaServed: [
          { "@type": "Country", name: "Nigeria" },
          { "@type": "Country", name: "United Kingdom" },
        ],
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
        parentOrganization: { "@id": `${site}#organization` },
        sameAs: [clientEnv.NEXT_PUBLIC_EDU_URL, clientEnv.NEXT_PUBLIC_CLEANING_URL],
      }}
    />
  );
}
