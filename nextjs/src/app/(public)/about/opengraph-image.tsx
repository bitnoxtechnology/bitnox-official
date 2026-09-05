import { ABOUT_HERO } from "@/content/about";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";

/**
 * The social card for the about page.
 *
 * One file per route segment, because Open Graph images do not cascade: a card in a parent
 * segment covers that segment's own page and nothing below it. The alternative is a page
 * whose link pastes into a chat as a bare URL, which is the state every one of these was in.
 *
 * The headline is the page's own, so the card argues what the page argues rather than
 * repeating the company name.
 */

export const alt = "About Bitnox Technology Solutions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function AboutOgImage() {
  return renderOgCard({
    eyebrow: ABOUT_HERO.eyebrow,
    title: oneLine(ABOUT_HERO.headline),
    meta: "Abeokuta, Ogun State",
  });
}

/** A headline written with a line break for the page, set as one line on the card. */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
