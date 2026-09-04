import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { SectionHeading } from "@/components/site";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { EVENT_SPACE_FAQS } from "@/content/event-space";

/**
 * The questions people ask before booking a room.
 *
 * The accordion and the `FAQPage` markup read the same array, which is the condition Google
 * states: markup describing answers that are not on the page is a manual action waiting to
 * happen. `FaqAccordion` keeps the closed answers in the document for the same reason.
 *
 * Four of these are here because they are the queries this page has to win: how many people
 * it holds, what it costs, where it is, and which days are free. Each answer is written to
 * stand on its own in a search result, without the page around it.
 */
export function FaqsSection() {
  return (
    <section className="section-y">
      <div className="container-page">
        <FAQPageSchema faqs={EVENT_SPACE_FAQS} />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Questions"
              title="Questions about booking the Event Space"
              description="If yours is not here, ask it in the enquiry form and we will answer it in the reply."
            />
          </div>

          <div className="lg:col-span-7">
            <FaqAccordion faqs={EVENT_SPACE_FAQS} />
          </div>
        </div>
      </div>
    </section>
  );
}
