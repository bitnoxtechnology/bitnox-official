import Image from "next/image";

import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { EVENT_SPACE_PHOTOS } from "@/content/event-space-media";
import { HOME_FAQS } from "@/content/faqs";

/**
 * The questions, the picture beside them, and the `FAQPage` markup that describes them.
 *
 * The accordion and the structured data read the same array. The markup has to describe
 * content that is visible on the page, and the reliable way to guarantee that is to give the
 * crawler and the reader one source rather than two that are meant to agree.
 *
 * The photograph on the left is the second of the two images carrying the page's layout. An
 * FAQ is a column of text that collapses and expands, and on a wide screen it either runs the
 * full width, where nobody can track a line, or it sits in a half-width column with an empty
 * half beside it. The picture fills that half with something real. It is sticky, so it stays
 * in view while the answers open and the column beside it grows.
 *
 * The accordion itself is the one client component in this section, and
 * `components/site/faq-accordion.tsx` explains why: keeping the answers in the document,
 * which the structured data depends on, needs the open panel to be known at render time.
 */
export function FaqSection() {
  // The second, not the first: the Event Space section above uses the cover shot, and one
  // photograph appearing twice on a page is what makes a set of real pictures look like stock.
  const photo = EVENT_SPACE_PHOTOS[1];

  return (
    <section className="section-y">
      <div className="container-page">
        <FAQPageSchema faqs={HOME_FAQS} />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading eyebrow="Questions" title="Frequently asked questions" />

              {photo ? (
                <figure className="glass relative mt-8 hidden aspect-4/3 w-full overflow-hidden rounded-2xl lg:block">
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="40vw"
                    className="object-cover"
                  />
                </figure>
              ) : null}

              <ActionButton href="/contact" variant="outline" size="sm" className="mt-8">
                Ask us directly
              </ActionButton>
            </div>
          </div>

          <div className="lg:col-span-7">
            <FaqAccordion faqs={HOME_FAQS} />
          </div>
        </div>
      </div>
    </section>
  );
}
