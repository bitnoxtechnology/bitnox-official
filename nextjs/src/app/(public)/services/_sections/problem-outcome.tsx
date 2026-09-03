import { Reveal, StaggerGroup } from "@/components/motion";
import type { Service } from "@/content/services";

/**
 * Where the work usually starts, and where it ends up.
 *
 * This was two glass panels side by side. The panels were doing nothing except drawing a
 * rounded box around two pieces of prose that would have read better without one, and they
 * gave the problem and the outcome exactly equal visual weight, which is wrong: the problem
 * is the half that has to be recognised, and recognition comes from a list of specifics a
 * reader can tick off, not from two paragraphs.
 *
 * So the problem side is a paragraph and then six short lines, each one something somebody
 * can see their own business in. The outcome side is narrower, separated by a single rule
 * rather than a border on four sides, and set on the page ground like everything else.
 *
 * The rule is a left border on the second column and only exists at `lg`. Stacked on a phone,
 * the two are already separated by the space between them, and a horizontal rule there would
 * read as the end of the section rather than as a division inside it.
 */
export function ProblemOutcome({ service }: { service: Service }) {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-2xs text-muted-foreground mb-4 font-medium tracking-[0.16em] uppercase">
              What we usually walk into
            </p>
            <h2 className="text-foreground text-section font-semibold">{service.problem.title}</h2>

            <div className="text-muted-foreground mt-stack measure grid gap-5 text-base">
              {service.problem.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <StaggerGroup asChild selector="li" className="border-border mt-10 border-t">
              <ul className="grid sm:grid-cols-2">
                {service.problem.painPoints.map((point) => (
                  <li
                    key={point}
                    className="border-border text-foreground flex gap-3 border-b py-3.5 pr-6 text-sm"
                  >
                    <span className="bg-primary mt-2 size-1 shrink-0 rounded-full" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </StaggerGroup>
          </div>

          <Reveal className="lg:border-border lg:col-span-5 lg:border-l lg:pl-16">
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              What you end up with
            </p>
            <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">
              {service.outcome.title}
            </h2>

            <div className="text-muted-foreground mt-stack grid gap-5 text-base">
              {service.outcome.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
