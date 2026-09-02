import Image from "next/image";

import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { SESSION_PHOTO } from "@/content/event-space-media";

/**
 * Who Bitnox is, condensed.
 *
 * Three paragraphs, a photograph and a link, not the whole About page. The landing page's job
 * is to give a first-time visitor enough to decide whether to keep reading, and a company
 * history at this point in the scroll is where people stop.
 *
 * The picture is the first of the two images that hold the page's layout together. It is a
 * real session in the room rather than a stock photograph of a laptop, which is the point:
 * the paragraph beside it says the same people who scope a project build it, and a photograph
 * of those people doing it is the only thing on the page that can corroborate that.
 *
 * The legacy version of this section led with a paragraph about being dynamic and innovative,
 * which said nothing, and put laundry in the middle of the technology copy. Neither is here.
 * Cleaning is a real part of the business and it is reachable from the footer; it has no place
 * on a page about software.
 */
export function AboutBand() {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <figure className="glass relative aspect-4/5 w-full overflow-hidden rounded-2xl">
              <Image
                src={SESSION_PHOTO.url}
                alt={SESSION_PHOTO.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </figure>
          </Reveal>

          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Who we are"
              title="A technology company that answers the phone"
            />

            <div className="text-muted-foreground mt-stack grid gap-5 text-base">
              <p>
                Bitnox Technology Solutions builds the systems businesses run on: order and
                inventory tools, customer portals, internal dashboards, websites and online stores.
                Our clients are in Nigeria, the United Kingdom and further afield.
              </p>
              <p>
                The same people who scope a project build it. There is no account layer between you
                and the person writing the code, which is why a question about a change usually gets
                an answer the same day rather than a ticket number.
              </p>
              <p>
                Alongside the client work we teach. Bitnox Education runs the courses, and the
                Bitnox Event Space seats sixty for the classes, conferences and meetings that come
                with them.
              </p>
            </div>

            <Reveal delay={0.1}>
              <ActionButton href="/about" variant="outline" className="mt-8">
                More about Bitnox
              </ActionButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
