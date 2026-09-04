import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

/**
 * A band of copy with a picture beside it.
 *
 * The workhorse of every public page below the hero, and the answer to a page made of rounded
 * cards. A card grid gives every item the same weight and the same shape, so the eye reads a
 * pattern instead of an argument. Alternating bands give each claim a turn, room to be more
 * than two sentences, and something to look at that is specific to it.
 *
 * `reverse` puts the media on the left. Pages alternate it down the page, which is what stops
 * three of these in a row reading as a template.
 *
 * The media column is whatever is passed in: one of the drawn interfaces from
 * `components/graphics/`, a photograph, a gallery. This component owns the column split, the
 * rhythm and the heading rank, and nothing else.
 *
 * The columns are seven and five rather than even. Copy needs the wider one to hold a
 * readable measure, and a drawn interface at five columns of a 80rem container is still around
 * 460px, which is enough for a dashboard to read as one.
 */
export function SplitSection({
  eyebrow,
  title,
  description,
  media,
  reverse = false,
  as = "h2",
  children,
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** The graphic, photograph or panel. Sits opposite the copy. */
  media: ReactNode;
  reverse?: boolean;
  as?: "h2" | "h3";
  /** Anything under the description: a list, facts, a call to action. */
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("section-y", className)}>
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className={cn("lg:col-span-7", reverse && "lg:order-2")}>
            <SectionHeading as={as} eyebrow={eyebrow} title={title} description={description} />
            {children}
          </div>

          <Reveal className={cn("lg:col-span-5", reverse && "lg:order-1")}>{media}</Reveal>
        </div>
      </div>
    </section>
  );
}
