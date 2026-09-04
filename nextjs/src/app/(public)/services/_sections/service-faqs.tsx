import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { FaqAccordion } from "@/components/site/faq-accordion";
import type { Service } from "@/content/services";

/**
 * The service-specific questions, and the `FAQPage` markup describing them.
 *
 * Different questions per service, not the landing page's nine repeated on every one of
 * them. The questions here are the ones asked on a first call about this particular service,
 * which is also what makes them worth marking up: the same `FAQPage` block duplicated across
 * pages is a quality problem, a distinct set per service is another chance on each page to be
 * the result that answers the query.
 *
 * Every answer that could carry a price says what the price depends on instead of naming a
 * figure or calling it affordable, which is the same rule the Event Space page follows.
 *
 * The accordion and the structured data read one array, so the markup cannot describe an
 * answer the page does not show.
 */
export function ServiceFaqs({ service }: { service: Service }) {
  return (
    <section className="section-y">
      <div className="container-page">
        <FAQPageSchema faqs={service.faqs} />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Questions"
                title={`${service.name} questions we are asked`}
              />
              <p className="text-muted-foreground mt-stack text-base">
                If yours is not here, ask it. We answer enquiries within one to two working days,
                and a question answered before a quote saves both of us a fortnight.
              </p>
              <ActionButton href="/contact" variant="outline" size="sm" className="mt-8">
                Ask us directly
              </ActionButton>
            </div>
          </div>

          <div className="lg:col-span-7">
            <FaqAccordion faqs={service.faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}
