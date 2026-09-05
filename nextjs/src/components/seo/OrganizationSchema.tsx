import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/content/business";
import { clientEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/urls";

/**
 * The company itself, as one node.
 *
 * `@id` is the site's origin with `#organization`, and that identifier is the point of this
 * block. `ServiceSchema`, `ArticleSchema` and `EventVenueSchema` all refer to it: a service
 * page says its provider is this organisation, a post says its publisher is, and the Event
 * Space says its parent organisation is. Emitted once with a stable id, those references
 * resolve to one company rather than to four descriptions of a company that happen to share
 * a name.
 *
 * It lives on `/about` because that is the page the markup describes and the page a search
 * engine treats as the entity's own. Putting it in the root layout would repeat the whole
 * block on every page of the site to say a thing that is true once.
 *
 * The address is the NAP from `src/content/business.ts`, matching the Google Business Profile
 * character for character. `sameAs` names the two sister domains, which is what says they are
 * the same company operating three properties rather than three unrelated sites that happen
 * to share a brand.
 *
 * No `foundingDate`, no `numberOfEmployees` and no `aggregateRating`. Structured data is
 * read as fact, and a figure invented to fill a field is a false statement in machine-readable
 * form.
 */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${clientEnv.NEXT_PUBLIC_SITE_URL}#organization`,
        name: BUSINESS.legalName,
        alternateName: BUSINESS.shortName,
        url: clientEnv.NEXT_PUBLIC_SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo.svg"),
        },
        description:
          "Bitnox Technology Solutions builds software, websites and business systems, advises on technology, and runs professional training for clients in Nigeria, the United Kingdom and beyond.",
        email: BUSINESS.email,
        telephone: BUSINESS.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.streetAddress,
          addressLocality: BUSINESS.locality,
          addressRegion: BUSINESS.region,
          addressCountry: BUSINESS.countryCode,
        },
        areaServed: [
          { "@type": "Country", name: "Nigeria" },
          { "@type": "Country", name: "United Kingdom" },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: BUSINESS.email,
          telephone: BUSINESS.phone,
          areaServed: ["NG", "GB"],
          availableLanguage: ["en"],
        },
        sameAs: [clientEnv.NEXT_PUBLIC_EDU_URL, clientEnv.NEXT_PUBLIC_CLEANING_URL],
      }}
    />
  );
}
