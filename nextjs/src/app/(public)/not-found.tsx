import type { Metadata } from "next";

import { NotFoundLinks } from "@/components/site/not-found-links";
import { StatusPage } from "@/components/site/status-page";

/**
 * A 404 inside the public chrome.
 *
 * This one catches `notFound()` from a public page, such as a blog slug that does not exist,
 * and it renders inside the group layout, so the header and footer are already around it.
 * The root `not-found.tsx` handles a URL that matched no route at all and has to draw its own
 * chrome, since no group layout applies there.
 *
 * `noindex` matters here. Without it a crawler that finds a broken link can index the 404
 * body under the missing URL, and a site accumulates indexed error pages.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function PublicNotFound() {
  return (
    <>
      <StatusPage
        code="404"
        title="That page is not here"
        description="The link may be old, or the address may have a typo in it. The pages below are the usual starting points."
        action={{ href: "/", label: "Go to the home page" }}
        secondaryAction={{ href: "/contact", label: "Tell us what you were looking for" }}
      />
      <NotFoundLinks />
    </>
  );
}
