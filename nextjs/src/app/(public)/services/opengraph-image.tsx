import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";

/**
 * The social card for the services hub.
 *
 * The hub is the page a proposal or an email links to when the subject is "what do you
 * actually do", so its card answers that rather than saying "Services".
 */

export const alt = "What Bitnox Technology Solutions builds";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function ServicesOgImage() {
  return renderOgCard({
    eyebrow: "Services",
    // No meta line. The card already carries the domain along the bottom, and the only
    // other thing to put here would be a list of the services, which the title covers.
    title: "What we build, and how each piece of work runs",
  });
}
