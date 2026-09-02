import { Mail, MapPin, Phone } from "lucide-react";

import { Reveal } from "@/components/motion";
import { ActionButton } from "@/components/site/action-button";
import { BUSINESS } from "@/content/business";

/**
 * The closing call to action.
 *
 * The last thing on the page is the three ways to reach the business, not another
 * restatement of what it does. Somebody who has read this far has decided; what they need
 * now is a phone number they can tap.
 *
 * `tel:` and `mailto:` rather than plain text, because most of this traffic is on a phone
 * and a number that cannot be dialled from the page is a number that gets copied wrong.
 *
 * It is not the shared `CTABand`. That component takes a heading, a line and up to two
 * buttons, and this needs a contact list beside them, so it is written out rather than bent
 * into a shape the component was not built for.
 */
export function ContactBand() {
  return (
    <section className="section-y">
      <div className="container-page">
        <Reveal>
          <div className="glass px-gutter py-section-sm rounded-2xl">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-6">
                <h2 className="text-foreground text-section font-semibold">
                  Tell us what you are trying to build
                </h2>
                <p className="text-muted-foreground text-lead mt-stack measure">
                  Describe the software, the website or the problem, and we will come back within
                  one to two working days, usually with questions before a number.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ActionButton href="/contact">Start a project</ActionButton>
                  <ActionButton href="/event-space" variant="outline">
                    Book the Event Space
                  </ActionButton>
                </div>
              </div>

              <address className="grid content-start gap-5 text-sm not-italic lg:col-span-6">
                <p className="flex gap-3">
                  <Phone className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                    className="text-foreground hover:text-primary text-base transition-colors"
                  >
                    {BUSINESS.phone}
                  </a>
                </p>
                <p className="flex gap-3">
                  <Mail className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="text-foreground hover:text-primary text-base transition-colors"
                  >
                    {BUSINESS.email}
                  </a>
                </p>
                <p className="text-muted-foreground flex gap-3">
                  <MapPin className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    {BUSINESS.streetAddress},<br />
                    {BUSINESS.locality}, {BUSINESS.region}, {BUSINESS.country}
                  </span>
                </p>
              </address>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
