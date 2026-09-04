import { SectionHeading } from "@/components/site";
import { EVENT_SPACE_USES } from "@/content/event-space";

/**
 * What the room is booked for.
 *
 * The heading is where the adjacent search intent lives. Conference hall, meeting room and
 * training room hire are three of the phrases people actually type, and all three describe
 * this room without renaming it. The name in the URL, the nav, the headings above and every
 * line of copy stays Event Space, because a room that is called a training room does not
 * sound like somewhere you hold a conference, and a room called an event centre attracts
 * wedding enquiries this room is not for.
 *
 * A ruled `dl` rather than seven cards. Each row is a use with a sentence saying what the
 * room does for it, which is more useful than a title and an icon, and seven rows of that
 * read faster than seven boxes.
 */
export function UsesSection() {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="What it is used for"
          title="Conference hall, meeting room and training room hire in Abeokuta"
          description="One room, laid out for whichever of these you are running. What it is not set up for is weddings, parties and receptions, and saying so here saves both of us an enquiry."
        />

        <dl className="border-border mt-section-sm border-t">
          {EVENT_SPACE_USES.map((use) => (
            <div
              key={use.name}
              className="border-border grid gap-2 border-b py-6 md:grid-cols-12 md:gap-8"
            >
              <dt className="text-foreground text-lg font-medium md:col-span-4">{use.name}</dt>
              <dd className="text-muted-foreground md:col-span-8">{use.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
