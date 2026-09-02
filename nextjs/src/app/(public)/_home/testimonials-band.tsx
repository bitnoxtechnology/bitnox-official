import { StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { getPublishedTestimonials } from "@/lib/queries/testimonials";

/**
 * Client quotes, cached under the `testimonials` tag.
 *
 * Real ones or none. Nothing here invents a client count, a star rating or a "trusted by"
 * line, and the section disappears entirely while the collection is empty rather than
 * standing in with sample quotes that would have to be remembered and removed later.
 */
export async function TestimonialsBand() {
  const testimonials = await getPublishedTestimonials(3);

  if (testimonials.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading eyebrow="In their words" title="What clients say about working with us" />

        <StaggerGroup asChild className="mt-section-sm grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ul>
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className="h-full">
                <TestimonialCard testimonial={testimonial} className="h-full" />
              </li>
            ))}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
