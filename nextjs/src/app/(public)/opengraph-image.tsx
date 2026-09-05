import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";

/**
 * The social card for the home page, and the default for every page that does not draw its
 * own.
 *
 * Metadata files cascade down the segment tree, so this one covers `/about`, `/contact`,
 * `/portfolio`, `/terms` and the rest without each of them needing a file. The pages that do
 * have their own are the ones where a generic card would be a wasted impression: a post, a
 * project, a service, and the Event Space.
 *
 * It sits in the route group rather than at `app/`, and that is not cosmetic. The home page
 * is `app/(public)/page.tsx`, and a metadata file is matched against the directory its page
 * is in: one placed at `app/` produces a working `/opengraph-image` URL that no page ever
 * references, which is the failure that leaves every card blank while looking correct in the
 * build output. Here it covers the public routes and, deliberately, not the admin.
 *
 * The claim on it is the same one the home page leads with, so a link pasted into a chat says
 * what the company does rather than repeating its name twice.
 */

export const alt = "Bitnox Technology Solutions: software, web development and IT consulting";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function HomeOgImage() {
  return renderOgCard({
    eyebrow: "Bitnox Technology",
    title: "Software, websites and business systems, built to be used",
    meta: "Abeokuta and the United Kingdom",
  });
}
