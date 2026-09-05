import type { Metadata } from "next";

import { AmenitiesSection } from "@/app/(public)/event-space/_sections/amenities-section";
import { AvailabilitySection } from "@/app/(public)/event-space/_sections/availability-section";
import { EnquirySection } from "@/app/(public)/event-space/_sections/enquiry-section";
import {
  EventSpaceFacts,
  EventSpaceHero,
} from "@/app/(public)/event-space/_sections/event-space-hero";
import { FaqsSection } from "@/app/(public)/event-space/_sections/faqs-section";
import { GallerySection } from "@/app/(public)/event-space/_sections/gallery-section";
import { LayoutsSection } from "@/app/(public)/event-space/_sections/layouts-section";
import { LocationSection } from "@/app/(public)/event-space/_sections/location-section";
import { UsesSection } from "@/app/(public)/event-space/_sections/uses-section";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { EventVenueSchema } from "@/components/seo/EventVenueSchema";
import { CTABand } from "@/components/site";
import type { GalleryImage } from "@/components/site/gallery";
import {
  DEFAULT_AMENITIES,
  DEFAULT_AVAILABILITY_COPY,
  EVENT_SPACE_SEO,
} from "@/content/event-space";
import { EVENT_SPACE_PHOTOS } from "@/content/event-space-media";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { getEventSpaceImages } from "@/lib/queries/event-space";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { absoluteImageUrl } from "@/lib/urls";

/**
 * The Event Space.
 *
 * The highest-leverage page on the site, and the only one with a physical location to rank
 * on locally. Everything below follows from that: the address is the NAP verbatim, the
 * headings carry the phrases people search for a room with, and the structured data says the
 * room seats sixty in a form a search engine can read.
 *
 * The order answers a booking decision in the order it is made. What is this and where is it,
 * what does it look like, can I have my date and what will it cost, does my group fit, what
 * is in the room, is it the right room for what I am running, when is it free and how does
 * booking work, how do I get there, and the awkward questions.
 *
 * The enquiry form sits fourth, immediately after the gallery, rather than at the foot of the
 * page. Nothing here publishes a rate, so the form is the pricing mechanism, and the moment a
 * reader has seen the room is the moment they want a figure. The hero's primary call to
 * action jumps straight to it, which is what puts it one tap away above the fold on a phone.
 * One form on the page rather than two copies of it: two would mean two sets of field ids,
 * two things to keep in step, and a reader who fills in the one that is not in view.
 *
 * Two things are admin-editable rather than fixed in the content module. The amenity list and
 * the availability copy come from `SiteSettings.eventSpace` when they are filled in, because
 * an amenity is a promise to somebody who has not visited and availability moves with the
 * teaching timetable. Both fall back to `src/content/event-space.ts` on a database that has
 * not been seeded, so the page is complete either way.
 *
 * The gallery is the `EventSpaceImage` collection, and the photographs shipped in
 * `public/event-space/` while it is empty. Both are pictures of the same room, so the
 * fallback is a real gallery rather than a grey placeholder.
 */

export const metadata: Metadata = {
  title: EVENT_SPACE_SEO.title,
  description: EVENT_SPACE_SEO.description,
  alternates: { canonical: "/event-space" },
  openGraph: {
    url: "/event-space",
    title: EVENT_SPACE_SEO.title,
    description: EVENT_SPACE_SEO.description,
  },
  twitter: {
    card: "summary_large_image",
    title: EVENT_SPACE_SEO.title,
    description: EVENT_SPACE_SEO.description,
  },
};

export default async function EventSpacePage() {
  const [uploaded, settings] = await Promise.all([getEventSpaceImages(), getSiteSettings()]);

  // The uploaded gallery when there is one, the shipped photographs until then. Never both:
  // a mixed set would show the same room twice under two different curations.
  const images: GalleryImage[] =
    uploaded.length > 0
      ? uploaded.map((image) => ({ url: image.url, alt: image.alt, caption: image.caption }))
      : EVENT_SPACE_PHOTOS.map((photo) => ({
          url: photo.url,
          alt: photo.alt,
          caption: photo.caption,
        }));

  const cover = images[0];

  const capacity = settings?.eventSpace.capacity ?? EVENT_SPACE_CAPACITY;

  const amenities =
    settings && settings.eventSpace.amenities.length > 0
      ? settings.eventSpace.amenities
      : DEFAULT_AMENITIES;

  const availabilityCopy = settings?.eventSpace.availabilityCopy || DEFAULT_AVAILABILITY_COPY;

  return (
    <>
      <EventVenueSchema
        capacity={capacity}
        amenities={amenities}
        images={images.map((image) => absoluteImageUrl(image.url))}
        openingHours={settings?.openingHours ?? []}
      />
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Event Space", path: "/event-space" },
        ]}
      />

      {cover ? <EventSpaceHero photo={cover} /> : null}
      <EventSpaceFacts capacity={capacity} />
      <GallerySection images={images} />
      <EnquirySection />
      <LayoutsSection capacity={capacity} />
      <AmenitiesSection amenities={amenities} />
      <UsesSection />
      <AvailabilitySection availabilityCopy={availabilityCopy} />
      <LocationSection />
      <FaqsSection />

      <CTABand
        title="Have a date in mind?"
        description="Send the date, the layout and how many people are coming. We will confirm whether the room is free and come back with a rate, usually within one working day."
        action={{ label: "Check a date", href: "#enquire" }}
        secondaryAction={{ label: "Talk to us", href: "/contact" }}
      />
    </>
  );
}
