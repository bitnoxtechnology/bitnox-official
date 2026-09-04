import { EventSpaceEnquiryForm } from "@/components/forms/event-space-enquiry-form";
import { SectionHeading } from "@/components/site";
import { QUOTE_FACTORS } from "@/content/event-space";
import { BUSINESS } from "@/content/business";

/**
 * The enquiry form, immediately after the gallery.
 *
 * Placed here rather than at the foot of the page on purpose. This form is the pricing
 * mechanism for the Event Space: no rate is published anywhere on this site, so the moment a
 * reader has seen the room is the moment they want a figure, and making them scroll past the
 * layouts, the amenities and the directions to ask for one is how a venue page loses to a
 * venue page with a price list.
 *
 * Beside it, what a quote depends on. Withholding a price and saying nothing reads as
 * something to hide; withholding it and stating the three things that move it gives a reader
 * enough to judge whether this room is in their range and enough to ask a useful question.
 * Nothing here says "affordable" or "competitive", which are the words a page reaches for
 * when it wants credit for a number it will not print.
 *
 * The phone number is on this section as well as in the footer. A date that is close is a
 * phone call, not a form, and somebody in that position should not have to hunt for the
 * number.
 */
export function EnquirySection() {
  return (
    <section id="enquire" className="section-y scroll-mt-24">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Check a date"
                title="Tell us the date and we will confirm the room"
                description="Rates depend on the date, how long you need the room and the setup you want, so they are quoted per booking rather than published. Send the three below and a figure comes back with the answer, usually within one working day."
              />

              <dl className="border-border mt-10 border-t">
                {QUOTE_FACTORS.map((factor) => (
                  <div key={factor.name} className="border-border border-b py-4">
                    <dt className="text-foreground text-base font-medium">{factor.name}</dt>
                    <dd className="text-muted-foreground mt-1 text-sm">{factor.description}</dd>
                  </div>
                ))}
              </dl>

              <p className="text-muted-foreground mt-8 text-sm">
                If your date is inside a week, call{" "}
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="text-primary">
                  {BUSINESS.phone}
                </a>{" "}
                instead. A room is either free that day or it is not, and that is a faster
                conversation than a form.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <EventSpaceEnquiryForm source="event-space" />
          </div>
        </div>
      </div>
    </section>
  );
}
