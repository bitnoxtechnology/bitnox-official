import { BUSINESS } from "@/content/business";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";

/**
 * The social card for the contact page.
 *
 * One file per route segment, because Open Graph images do not cascade: a card in a parent
 * segment covers that segment's own page and nothing below it. The alternative is a page
 * whose link pastes into a chat as a bare URL, which is the state every one of these was in.
 *
 * The headline is the page's own, so the card argues what the page argues rather than
 * repeating the company name.
 */

export const alt = "Contact Bitnox Technology Solutions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function ContactOgImage() {
  return renderOgCard({
    eyebrow: "Contact",
    title: "Tell us what has to change. We read every one.",
    meta: BUSINESS.phone,
  });
}
