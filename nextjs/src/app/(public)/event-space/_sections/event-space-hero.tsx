import Image from "next/image";
import Link from "next/link";

import { Reveal, SplitText } from "@/components/motion";
import { ActionButton } from "@/components/site/action-button";
import type { GalleryImage } from "@/components/site/gallery";
import { EVENT_SPACE_HERO, ROOM_LAYOUTS } from "@/content/event-space";

/**
 * The top of the Event Space page.
 *
 * The same shape as the landing page hero and the service pages: breadcrumb, eyebrow, a
 * headline that makes a claim rather than repeating the page's name, one lead paragraph on
 * the centre line, two calls to action, and then something real underneath. Here that last
 * thing is the room itself, which is the only honest thing to put at the top of a page about
 * a room.
 *
 * The primary call to action is the enquiry form further down. That is the whole pricing
 * mechanism for this page, so on a phone the first thing above the fold after the headline is
 * a button that goes straight to it, and the form is repeated in the reader's path after the
 * gallery rather than hidden at the foot of the page.
 *
 * The photograph is `priority`, since it is the largest thing on the screen and the element
 * the page's LCP is measured on. It is the cover image from the gallery collection once an
 * admin has marked one, and one of the photographs shipped in `public/event-space/` until
 * then, so the hero is never a grey box on a fresh database.
 */
export function EventSpaceHero({ photo }: { photo: GalleryImage }) {
  return (
    <section className="pt-section-sm pb-section-sm lg:pt-section">
      <div className="container-page">
        <nav aria-label="Breadcrumb">
          <ol className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground" aria-current="page">
              Event Space
            </li>
          </ol>
        </nav>

        <div className="mx-auto mt-10 max-w-4xl text-center">
          <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
            {EVENT_SPACE_HERO.eyebrow}
          </p>

          <SplitText
            as="h1"
            by="word"
            delay={0.1}
            text={EVENT_SPACE_HERO.headline}
            accentLines={[1]}
            className="text-foreground text-display font-semibold"
          />

          <Reveal delay={0.3}>
            <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
              {EVENT_SPACE_HERO.lead}
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <ActionButton href="#enquire">Check a date</ActionButton>
              <ActionButton href="#gallery" variant="outline">
                See the room
              </ActionButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.6} className="mt-section-sm mx-auto max-w-5xl">
          <figure className="glass relative aspect-16/9 w-full overflow-hidden rounded-2xl">
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 64rem"
              className="object-cover"
            />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The four facts a booking decision starts from, as a rule across the page.
 *
 * Directly under the hero, because these are what somebody comparing two venues in Abeokuta
 * is scanning for, and making them scroll for the capacity is how a page loses a booking to a
 * page that stated it. A ruled strip rather than four rounded cards: same four facts, a third
 * of the height, and it reads as part of the page instead of chips scattered under a
 * headline.
 *
 * The fourth says rates are quoted rather than published. It sits beside the other three
 * because withholding a price silently is what makes a reader assume the worst; saying why,
 * next to the capacity and the address, is what keeps them reading.
 */
export function EventSpaceFacts({ capacity }: { capacity: number }) {
  const facts = [
    { label: "Capacity", value: `${capacity} seated` },
    {
      label: "Layouts",
      // Read from the content module rather than retyped, so a layout added there
      // cannot be missing from the one line most readers scan.
      value: ROOM_LAYOUTS.map((layout) => layout.name).join(", "),
    },
    { label: "Where", value: "Lalubu Street, Oke-Ilewo, Abeokuta" },
    { label: "Rates", value: "Quoted per booking, not published" },
  ];

  return (
    <section>
      <div className="container-page">
        <h2 className="sr-only">The Event Space at a glance</h2>
        <dl className="border-border divide-border grid divide-y border-y lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {facts.map((fact) => (
            <div key={fact.label} className="px-1 py-4 lg:px-6 lg:py-6">
              <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                {fact.label}
              </dt>
              <dd className="text-foreground mt-2 text-sm">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
