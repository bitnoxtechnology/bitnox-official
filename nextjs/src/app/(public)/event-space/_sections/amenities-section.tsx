import { StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";

/**
 * What the room comes with.
 *
 * A ruled grid rather than a grid of icon cards. Six rounded boxes each holding an icon and
 * two words is the shape a reader recognises as filler, and an amenity list is exactly the
 * content that tempts a page into it. Ruled rows say the same six things and let the eye run
 * down them.
 *
 * The list comes from `SiteSettings.eventSpace.amenities` when an admin has filled it in, and
 * from the defaults in `src/content/event-space.ts` until then. That matters more here than
 * on most sections: every line is a promise made to somebody who has not seen the room, and
 * the person who can correct it should not need a deploy to do it.
 *
 * The line underneath is not a hedge. A room booked for a product launch and a room booked
 * for a five-day course need different things at the front of it, and the enquiry is where
 * that gets settled.
 */
export function AmenitiesSection({ amenities }: { amenities: readonly string[] }) {
  if (amenities.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Amenities"
          title="What the room comes with"
          description="The room is set up before you arrive, with the layout you asked for and the equipment in place."
        />

        <StaggerGroup asChild selector="li" className="border-border mt-section-sm border-t">
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <li
                key={amenity}
                className="border-border text-foreground border-b py-4 pr-6 text-base"
              >
                {amenity}
              </li>
            ))}
          </ul>
        </StaggerGroup>

        <p className="text-muted-foreground measure mt-8 text-sm">
          If your session needs something that is not on this list, say so in your enquiry. Some
          things we have, some we can arrange, and we will tell you plainly which is which.
        </p>
      </div>
    </section>
  );
}
