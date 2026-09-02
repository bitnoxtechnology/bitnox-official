import { Reveal } from "@/components/motion";
import { ActionButton } from "@/components/site/action-button";
import { EDU_URL } from "@/content/properties";

/**
 * The route to the courses.
 *
 * This band exists because of a specific failure the old site had: somebody searching for
 * technology training in Abeokuta landed here, found training named among the services, and
 * had no obvious way to reach a course list, dates or an enrolment form, because all of that
 * lives on `edu.bitnoxsolution.com`.
 *
 * So the signpost is unmissable by design. It is a full-width band, it interrupts the
 * scroll, and the primary action leaves this domain. It is one of five places the education
 * site is linked, alongside the header, the hero, the Technology Training service page and
 * the footer, and the repetition is the point rather than an oversight.
 *
 * Both actions are the shared pill button, whose trailing badge already carries the arrow
 * that says a link leads somewhere. The outbound one adds `rel="noopener"`, which the button
 * applies for any action marked external.
 */
export function TrainingBand() {
  return (
    <section className="section-y">
      <div className="container-page">
        <Reveal>
          <div className="glass px-gutter py-section-sm rounded-2xl">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
                  Looking for a course?
                </p>
                <h2 className="text-foreground text-section font-semibold">
                  The courses are on Bitnox Education
                </h2>
                <p className="text-muted-foreground text-lead mt-stack measure">
                  Software development, data and digital skills, taught in person in Abeokuta and
                  online. Course listings, dates, fees and enrolment are all handled on the
                  education site.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
                <ActionButton href={EDU_URL} external>
                  Go to Bitnox Education
                </ActionButton>
                <ActionButton href="/services/technology-training" variant="outline">
                  Training for a team
                </ActionButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
