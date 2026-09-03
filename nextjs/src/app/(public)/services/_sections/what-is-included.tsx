import { StaggerGroup } from "@/components/motion";
import { ActionButton } from "@/components/site/action-button";
import type { Service } from "@/content/services";

/**
 * What is included, as a specification rather than a card grid.
 *
 * Six rounded cards in a three-column grid is what this was, and it is the single most
 * recognisable shape on an agency site that nobody wrote: six equal boxes, six two-word
 * headings, six sentences of the same length. The information was fine. The form said the
 * page had been assembled rather than written.
 *
 * The same six items now read as a specification. The heading is sticky in the left column
 * and the items run down the right as ruled rows, title and body side by side, which is how
 * a scope document or a spec sheet is actually laid out. It scans faster, it holds longer
 * bodies without the cards growing to match the tallest, and the rules are doing the work
 * that six borders were doing before.
 *
 * The number in front of each title is not decoration. These items are the line items of a
 * quote, and numbering them is what makes the section read as a list somebody is accountable
 * to rather than a set of capabilities loosely gathered under a heading.
 */
export function WhatIsIncluded({ service }: { service: Service }) {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
                Scope
              </p>
              <h2 className="text-foreground text-section font-semibold">
                What is included in {service.name}
              </h2>
              <p className="text-muted-foreground mt-stack text-base">
                Every line below is scoped in writing before anything starts, so the quote and this
                list say the same thing. Anything found later is priced as a change rather than
                absorbed and delivered late.
              </p>

              <ActionButton href="/contact" variant="outline" size="sm" className="mt-8">
                Ask for a scope
              </ActionButton>
            </div>
          </div>

          <StaggerGroup asChild selector="div[data-item]" className="lg:col-span-8">
            <dl className="border-border border-t">
              {service.deliverables.map((item, index) => (
                <div
                  key={item.title}
                  data-item
                  className="border-border grid gap-2 border-b py-6 sm:grid-cols-12 sm:gap-8"
                >
                  <dt className="text-foreground flex gap-4 text-base font-semibold sm:col-span-5">
                    <span className="text-muted-foreground pt-0.5 font-mono text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.title}
                  </dt>
                  <dd className="text-muted-foreground text-sm sm:col-span-7">{item.body}</dd>
                </div>
              ))}
            </dl>
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
