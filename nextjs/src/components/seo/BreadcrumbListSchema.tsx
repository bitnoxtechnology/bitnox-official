import { JsonLd } from "@/components/seo/JsonLd";
import { clientEnv } from "@/lib/env";

/**
 * `BreadcrumbList` structured data.
 *
 * What it buys is the trail under the result in Google rather than a bare URL, which is
 * worth most on the pages that sit two levels down: a service page reading
 * "Bitnox > Services > Web Development" says where it belongs before anybody clicks it.
 *
 * The URLs are absolute. `metadataBase` makes Next resolve the relative paths a page
 * declares in its `metadata`, but nothing resolves paths inside a JSON-LD block, and a
 * crawler reading `/services` in an `item` field has no origin to attach it to.
 *
 * The last crumb is the current page and still carries its own URL. A self-referencing final
 * item is what Google's example does, and leaving it off has the list describe a trail that
 * stops one step short of where the reader is.
 */
export interface Crumb {
  name: string;
  /** Path from the site root, starting with a slash. Made absolute here. */
  path: string;
}

export function BreadcrumbListSchema({ crumbs }: { crumbs: readonly Crumb[] }) {
  if (crumbs.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${clientEnv.NEXT_PUBLIC_SITE_URL}${crumb.path}`,
        })),
      }}
    />
  );
}
