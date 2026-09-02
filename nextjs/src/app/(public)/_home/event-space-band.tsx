import Image from "next/image";

import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { Badge } from "@/components/ui/badge";
import { EVENT_SPACE_PHOTOS } from "@/content/event-space-media";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { getEventSpaceImages } from "@/lib/queries/event-space";

/**
 * The Event Space teaser.
 *
 * The room is called the Event Space here and everywhere else. Not a training room, not a
 * workspace, not a hub, and not an event centre: the first two undersell sixty seats, the
 * third does not say it can be booked, and the fourth brings in wedding enquiries, which is
 * the wrong audience for a room used for conferences, workshops and classes.
 *
 * One photograph, and two columns of equal width.
 *
 * This started as four tiles and then two. Both were wrong for the same reason: a teaser does
 * not need a gallery, and every extra frame on this row bought another edge to align and
 * another crop to fight. The Event Space page is where somebody who wants to see all of it
 * goes.
 *
 * With one image the column split is even rather than five to seven, so the picture and the
 * copy carry the same weight and their edges line up. The frame is `4/3`, which is the native
 * ratio of the photographs, so the room is shown rather than centre-cropped out of a shape it
 * was never taken in.
 *
 * What the room is booked for moved out of the paragraph and into the row of labels, which is
 * where a reader scanning for "workshop" or "conference" will actually find it, and which
 * stops the description being a comma-separated list with a sentence wrapped around it.
 * Adjacent search intent is picked up there rather than by renaming the space.
 *
 * No rate appears here or on the Event Space page. Rates depend on the date, the length of the
 * booking and the setup, and the enquiry form is how a figure is reached.
 *
 * This is the one section on the landing page where the city belongs in the copy. Everywhere
 * else naming it frames a company working across several countries as a local shop; here the
 * whole proposition is a physical room that somebody has to be able to drive to.
 *
 * The photograph falls back to the first one shipped in `public/event-space/` while the
 * database has no rows, which is its state until an admin uploads some. The shipped set is of
 * the same room, so the fallback is a real teaser rather than a grey placeholder tile, and the
 * cover image replaces it as soon as there is one.
 */

/** What the room gets booked for. Each one is a search term somebody types. */
const USES = ["Conferences", "Meetings", "Workshops", "Tech gatherings", "Classes"];

export async function EventSpaceBand() {
  const [uploaded] = await getEventSpaceImages(1);
  const photo = uploaded ?? EVENT_SPACE_PHOTOS[0];

  return (
    <section className="section-y">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Event Space"
              title={`A room that seats ${EVENT_SPACE_CAPACITY}, on Lalubu Street`}
              description="The Bitnox Event Space is in Oke-Ilewo, Abeokuta, in the same building as the office. Tell us the date, how long you need the room and the layout you want, and we will confirm what is available."
            />

            <ul className="mt-8 flex flex-wrap gap-2">
              {USES.map((use) => (
                <li key={use}>
                  <Badge variant="secondary">{use}</Badge>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground mt-6 text-sm">
              Rates depend on the date, the length of the booking and the setup, so they are quoted
              on enquiry rather than published here.
            </p>

            <ActionButton href="/event-space" className="mt-8">
              See the space and check a date
            </ActionButton>
          </div>

          {photo ? (
            <Reveal>
              <figure className="glass relative aspect-4/3 w-full overflow-hidden rounded-2xl">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                {photo.caption ? (
                  <figcaption className="from-background/90 text-foreground absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-5 pt-12 pb-4 text-sm">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
