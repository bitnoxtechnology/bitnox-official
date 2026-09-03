import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/content/business";
import { servicePath, type Service } from "@/content/services";
import { clientEnv } from "@/lib/env";

/**
 * `Service` structured data, one block per service page.
 *
 * The four fields that carry weight are `serviceType`, `provider`, `areaServed` and the
 * offer catalogue. `serviceType` is the phrase a search engine matches the page against;
 * `provider` ties all four pages back to the same organisation at the same address, which is
 * the association the Event Space page's local ranking also depends on; `areaServed` states
 * that this is not only an Abeokuta business, which the office address on its own implies.
 *
 * The catalogue lists the named capabilities: cloud infrastructure, digital marketing and
 * cybersecurity are inside it rather than being pages of their own, so this is where those
 * terms are stated in machine-readable form.
 *
 * No `offers` and no `priceRange`. Nothing on this site publishes a rate, and price markup
 * that guesses is worse than absent markup, exactly as on the Event Space page.
 */
export function ServiceSchema({ service }: { service: Service }) {
  const url = `${clientEnv.NEXT_PUBLIC_SITE_URL}${servicePath(service.slug)}`;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.name,
        serviceType: service.name,
        description: service.seo.description,
        url,
        provider: {
          "@type": "Organization",
          name: BUSINESS.legalName,
          url: clientEnv.NEXT_PUBLIC_SITE_URL,
          telephone: BUSINESS.phone,
          email: BUSINESS.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: BUSINESS.streetAddress,
            addressLocality: BUSINESS.locality,
            addressRegion: BUSINESS.region,
            addressCountry: BUSINESS.countryCode,
          },
        },
        areaServed: [
          { "@type": "Country", name: "Nigeria" },
          { "@type": "Country", name: "United Kingdom" },
          { "@type": "City", name: BUSINESS.locality },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${service.name} capabilities`,
          itemListElement: service.capabilities.map((capability) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: capability },
          })),
        },
      }}
    />
  );
}
