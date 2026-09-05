import { CLEANING_HERO } from "@/content/cleaning";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/card";

/**
 * The social card for the cleaning overview.
 *
 * One file per route segment, because Open Graph images do not cascade: a card in a parent
 * segment covers that segment's own page and nothing below it. The alternative is a page
 * whose link pastes into a chat as a bare URL, which is the state every one of these was in.
 *
 * The headline is the page's own, so the card argues what the page argues rather than
 * repeating the company name.
 */

export const alt = "Bitnox Cleaning";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function CleaningOgImage() {
  return renderOgCard({
    eyebrow: CLEANING_HERO.eyebrow,
    title: oneLine(CLEANING_HERO.headline),
    meta: "cleaning.bitnoxsolution.com",
  });
}

/** A headline written with a line break for the page, set as one line on the card. */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
