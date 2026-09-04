import Image from "next/image";

import { SplitSection } from "@/components/site/split-section";
import { SESSION_PHOTO } from "@/content/event-space-media";

/**
 * When the room is free, and how a booking actually happens.
 *
 * The availability explanation is the one thing this page cannot leave out. The Event Space
 * is also where Bitnox classes run, so it is not free every weekday, and a visitor who plans
 * a conference around an assumption and finds out afterwards has been let down by the page
 * rather than by the room. Saying it in the second sentence costs nothing and is the reason
 * the enquiry asks for a date first.
 *
 * The three steps are a numbered list against one continuous rule rather than three cards.
 * A sequence has an order, and three boxes side by side is the one layout that hides it.
 *
 * The copy comes from `SiteSettings.eventSpace.availabilityCopy` when an admin has written
 * one, and from the default in `src/content/event-space.ts` until then. Availability changes
 * with the teaching timetable, which is exactly the kind of thing that should not need a
 * deploy.
 *
 * The photograph beside it is a session running in the room. It is the one picture on the
 * page with people in it, which is what makes it the right one here: this section is about
 * the room being in use.
 */

const STEPS = [
  {
    title: "Send the date",
    body: "The date, roughly how long you need the room, the layout you want and how many people are coming. Four things, one form.",
  },
  {
    title: "We confirm and quote",
    body: "We check the date against the teaching timetable and reply with whether it is free and what it costs, usually within one working day. If it is taken, the reply says what else is free that week.",
  },
  {
    title: "The room is held",
    body: "Once you confirm, the date is yours and the room is laid out before your start time. Anything that has to be arranged, such as catering coming in, is settled then rather than on the day.",
  },
];

export function AvailabilitySection({ availabilityCopy }: { availabilityCopy: string }) {
  return (
    <SplitSection
      eyebrow="Availability"
      title="Classes on some weekdays, open for booking on the rest"
      description={availabilityCopy}
      media={
        <figure className="glass relative aspect-4/3 w-full overflow-hidden rounded-2xl">
          <Image
            src={SESSION_PHOTO.url}
            alt={SESSION_PHOTO.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        </figure>
      }
      reverse
    >
      <ol className="border-border mt-10 border-l pl-6">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative pb-8 last:pb-0">
            <span
              aria-hidden
              className="text-2xs text-primary border-border bg-background absolute top-0 -left-[2.05rem] grid size-6 place-items-center rounded-full border font-mono"
            >
              {index + 1}
            </span>
            <h3 className="text-foreground text-base font-medium">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{step.body}</p>
          </li>
        ))}
      </ol>
    </SplitSection>
  );
}
