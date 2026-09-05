import { EVENT_SPACE_PHOTOS } from "@/content/event-space-media";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { OG_CONTENT_TYPE, OG_SIZE, photoDataUri, renderOgCard } from "@/lib/og/card";
import { getSiteSettings } from "@/lib/queries/site-settings";

/**
 * The social card for the Event Space.
 *
 * The capacity is the fact the page exists to state, so it is the fact on the card. It is
 * read from `SiteSettings` with the same fallback the page uses, rather than written here a
 * second time, because a card claiming a different number from the page it links to is the
 * kind of contradiction nobody notices until a caller quotes it back.
 *
 * It is the one card on the site drawn over a photograph, because it is the one page whose
 * subject is a physical thing. The picture is the same one the gallery leads with, under a
 * scrim so the type stays readable, which beats both a bare headline and the untreated
 * photograph the page used to hand to Open Graph: that one had no capacity on it, no name and
 * nothing to say it was a room you could book.
 *
 * No rate, here as everywhere else on the site.
 */

export const alt = "The Bitnox Event Space in Abeokuta";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function EventSpaceOgImage() {
  const cover = EVENT_SPACE_PHOTOS[0];

  const [settings, photo] = await Promise.all([
    getSiteSettings(),
    cover ? photoDataUri(cover.url) : undefined,
  ]);

  const capacity = settings?.eventSpace.capacity ?? EVENT_SPACE_CAPACITY;

  return renderOgCard({
    eyebrow: "Event Space",
    title: "A room in Abeokuta for conferences, workshops and training",
    meta: `Seats ${capacity}, Oke-Ilewo`,
    photo,
  });
}
