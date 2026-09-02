import { JsonLd } from "@/components/seo/JsonLd";
import type { Faq } from "@/content/faqs";

/**
 * `FAQPage` structured data.
 *
 * Paired with a visible accordion holding exactly the same questions and answers, which is
 * the condition Google states and enforces: markup describing content that is not on the
 * page is a manual action waiting to happen. Both read the same array, so they cannot fall
 * out of step.
 *
 * The answers are plain text rather than HTML. `acceptedAnswer.text` allows a small amount
 * of markup, but the answers here are written as sentences that stand on their own in a
 * search result, and passing text keeps the markup honest about what the page shows.
 */
export function FAQPageSchema({ faqs }: { faqs: readonly Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}
