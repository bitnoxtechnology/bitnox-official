import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/content/business";
import { clientEnv } from "@/lib/env";

/**
 * The site itself, as distinct from the company that runs it.
 *
 * `Organization` on `/about` describes Bitnox. This describes `bitnoxsolution.com`: one
 * `WebSite` node, identified as `#website`, whose publisher is the `#organization` node. Two
 * nodes rather than one because they are two things, and because the properties below belong
 * to a site and would be meaningless on a company.
 *
 * The `SearchAction` is the part worth being careful about. It is what a sitelinks search box
 * is built from, and it is a promise that the URL template returns search results. That is
 * the reason `/blog` takes a `q` parameter: the markup came second. Emitting this against a
 * page that ignores the parameter would produce a search box in the results that returns the
 * blog index whatever somebody types into it, which is a worse outcome than not having one.
 *
 * It lives on the home page, which is the URL the node describes and the only page where a
 * search engine looks for it.
 */
export function WebSiteSchema() {
  const site = clientEnv.NEXT_PUBLIC_SITE_URL;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${site}#website`,
        url: site,
        name: BUSINESS.legalName,
        alternateName: BUSINESS.shortName,
        description:
          "Software development, web development, IT consulting and technology training, from Abeokuta, Nigeria and the United Kingdom.",
        inLanguage: "en",
        publisher: { "@id": `${site}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site}/blog?q={search_term_string}`,
          },
          // The literal string the specification requires, naming the placeholder above.
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}
