import { SectionHeading } from "@/components/site";
import { BUSINESS } from "@/content/business";
import { EVENT_SPACE_LOCATION } from "@/content/event-space";

/**
 * Where the room is, and how to reach it.
 *
 * The address is the NAP from `src/content/business.ts`, which is the only copy of it on the
 * site. It has to match the Google Business Profile character for character, because the gap
 * between the two is what weakens the local signal this page depends on more than any other.
 *
 * The directions are written for a driver rather than for a crawler. Anyone in Oke-Ilewo
 * knows the Chicken Republic on Lalubu Street, which is why it is in the address on the
 * profile and why it is the first thing said here.
 *
 * The map is Google's embed rather than a mapping library. It needs no key, ships no
 * JavaScript to this page, and it is the map the visitor already knows how to use. It is
 * lazy, so it costs nothing until somebody scrolls this far, and it is titled, because an
 * untitled iframe is an unlabelled region to a screen reader.
 */
export function LocationSection() {
  const query = `${BUSINESS.latitude},${BUSINESS.longitude}`;

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Location"
          title="Where the Event Space is, and how to get here"
          description="Oke-Ilewo, Abeokuta, in the same building as the Bitnox office. Ten minutes from Kuto and on the road most people already use to cross town."
        />

        <div className="mt-section-sm grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <dl className="border-border divide-border divide-y border-y">
              <div className="py-5">
                <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                  Address
                </dt>
                <dd className="text-foreground mt-2 text-base">
                  {/* A real `address` element, which is what it is, with the browser's
                      italic default turned off. */}
                  <address className="not-italic">
                    {BUSINESS.streetAddress}
                    <br />
                    {BUSINESS.locality}, {BUSINESS.region}
                    <br />
                    {BUSINESS.country}
                  </address>
                </dd>
              </div>

              <div className="py-5">
                <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                  Getting here
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  {EVENT_SPACE_LOCATION.directions}
                </dd>
              </div>

              <div className="py-5">
                <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                  Parking
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  {EVENT_SPACE_LOCATION.parking}
                </dd>
              </div>

              <div className="py-5">
                <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                  Nearby
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  <ul className="space-y-1">
                    {EVENT_SPACE_LOCATION.landmarks.map((landmark) => (
                      <li key={landmark}>{landmark}</li>
                    ))}
                  </ul>
                </dd>
              </div>

              <div className="py-5">
                <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                  Phone
                </dt>
                <dd className="mt-2 text-base">
                  <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="text-primary">
                    {BUSINESS.phone}
                  </a>
                </dd>
              </div>
            </dl>

            <p className="text-muted-foreground mt-8 text-sm">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                rel="noopener"
                className="text-primary font-medium"
              >
                Open in Google Maps
              </a>{" "}
              for turn by turn directions from where you are.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="glass aspect-4/3 w-full overflow-hidden rounded-2xl lg:aspect-16/10">
              <iframe
                title="Map showing the Bitnox Event Space on Lalubu Street, Oke-Ilewo, Abeokuta"
                src={`https://www.google.com/maps?q=${query}&hl=en&z=16&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
