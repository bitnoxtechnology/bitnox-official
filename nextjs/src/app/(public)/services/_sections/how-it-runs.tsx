import { ServiceGraphic } from "@/components/graphics/service-graphics";
import { Reveal, StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import type { Service } from "@/content/services";

/**
 * How the engagement runs, beside the thing it produces.
 *
 * The rail is a numbered column rather than a row of cards, because the steps are a sequence
 * and a grid that wraps to two rows breaks the reading order at exactly the width most people
 * see it at. The numbers come from an ordered list, so they are in the document rather than
 * painted on by CSS, and a screen reader announces the count correctly with styles off.
 *
 * The rule down the left is one border on the list, not a divider per item. Five separate
 * hairlines with gaps between them read as five boxes; one continuous line reads as a
 * sequence, which is the thing the section is trying to say.
 *
 * Beside it sits the artefact the process produces: the signed scope, the numbers a page is
 * measured against, the order of work, the training brief. It is sticky, so it stays in view
 * while the steps scroll past it, and it is the reason this section can make a claim about
 * process without asking to be taken on trust.
 */
export function HowItRuns({ service }: { service: Service }) {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it runs"
          title="What working with us on this looks like"
          description="The same order every time, so at any point you know what has happened and what comes next."
        />

        <div className="mt-section-sm grid gap-12 lg:grid-cols-12 lg:gap-16">
          <StaggerGroup asChild selector="li" className="lg:col-span-7">
            <ol className="border-border ml-5 grid gap-10 border-l pl-8 sm:ml-0 sm:pl-12">
              {service.process.map((step, index) => (
                <li key={step.title} className="relative">
                  <span
                    aria-hidden
                    className="bg-background text-primary border-border absolute top-0 -left-13 grid size-9 place-items-center rounded-full border text-sm font-medium sm:-left-17"
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-foreground text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground measure mt-3 text-base">{step.body}</p>
                </li>
              ))}
            </ol>
          </StaggerGroup>

          <Reveal className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <ServiceGraphic slug={service.slug} variant="detail" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
