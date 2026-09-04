import { GraphicCaption } from "@/components/graphics/window-frame";
import { RoomPlans } from "@/components/graphics/room-plans";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROOM_LAYOUTS } from "@/content/event-space";

/**
 * Capacity and layouts.
 *
 * A real table, because this is four options a reader is comparing across the same two
 * questions, and that is the one shape a table does better than anything else. Four cards
 * would give each layout the same weight and force the eye to re-find "best for" in every
 * one of them. On a phone it scrolls sideways rather than collapsing into four stacked
 * blocks, which is what the wrapper below is for.
 *
 * The heading names a boardroom meeting and a conference in one line. Somebody searching for
 * a meeting room or a conference hall in Abeokuta is looking for exactly this room, and this
 * is where those words belong: in a heading about what the room does, rather than in a
 * renaming of it.
 *
 * There is one number on this page and it is sixty, in theatre layout, which is a fact about
 * the room. What a classroom or a boardroom setup seats depends on the tables in the room
 * that day, and an invented figure here is one somebody would quote back to us after booking
 * on the strength of it.
 */
export function LayoutsSection({ capacity }: { capacity: number }) {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Capacity and layouts"
          title="From a boardroom meeting to a conference for sixty"
          description={`The room seats ${capacity} in theatre layout. Classroom, boardroom and U-shape hold fewer, because the tables take floor space. Tell us the layout and how many people are coming, and we will confirm the number before you commit to anything.`}
        />

        <div className="mt-section-sm grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {/* The table sets its own minimum width and this scrolls, rather than the table
                reflowing into four stacked blocks that lose the comparison. */}
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[34rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Layout</TableHead>
                    <TableHead>Best for</TableHead>
                    <TableHead>How the room is set out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ROOM_LAYOUTS.map((layout) => (
                    <TableRow key={layout.name}>
                      <TableCell className="text-foreground font-medium">{layout.name}</TableCell>
                      <TableCell className="text-muted-foreground">{layout.bestFor}</TableCell>
                      <TableCell className="text-muted-foreground">{layout.setup}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-muted-foreground mt-8 text-sm">
              The room is laid out before your start time, so the first thing your group does is sit
              down. A change of layout partway through a booking is possible with notice, since it
              takes a break long enough to move tables.
            </p>
          </div>

          <Reveal className="lg:col-span-5">
            <figure>
              <RoomPlans />
              <GraphicCaption>
                Illustrative plans of each layout, with the screen at the front of the room. The
                number of seats in each is confirmed when you enquire.
              </GraphicCaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
