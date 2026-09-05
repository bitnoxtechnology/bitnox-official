import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/content/business";
import { clientEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/urls";

/**
 * `AboutPage`, pointing at the organisation it is about.
 *
 * A separate block from `OrganizationSchema` and a small one, because the two say different
 * things. That one describes the company and is referenced from every other page's markup;
 * this one says that this particular URL is the page about that company, which is what
 * `mainEntity` on an `AboutPage` is for.
 *
 * `mainEntity` is a reference by `@id` rather than a second copy of the organisation.
 * Repeating the whole node would put two descriptions of one company in the same document and
 * leave a crawler to reconcile them.
 */
export function AboutPageSchema() {
  const url = absoluteUrl("/about");

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${url}#about`,
        url,
        name: `About ${BUSINESS.legalName}`,
        description:
          "How Bitnox Technology Solutions works: what the four services cover, what an engagement looks like from the first conversation, and where the company is based.",
        inLanguage: "en-GB",
        mainEntity: { "@id": `${clientEnv.NEXT_PUBLIC_SITE_URL}#organization` },
        isPartOf: {
          "@type": "WebSite",
          "@id": `${clientEnv.NEXT_PUBLIC_SITE_URL}#website`,
          name: BUSINESS.legalName,
          url: clientEnv.NEXT_PUBLIC_SITE_URL,
        },
      }}
    />
  );
}
