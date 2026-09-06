import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { OpeningHours } from "@/app/(public)/contact/_sections/opening-hours";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal, SplitText } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { CTABand, InlineLink, SectionHeading } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { BUSINESS } from "@/content/business";
import { EDU_URL } from "@/content/properties";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { getSiteSettings } from "@/lib/queries/site-settings";

/**
 * Contact.
 *
 * One form, the NAP, the hours and a map. The whole page exists to remove reasons not to get
 * in touch, so the four ways of doing it are on screen together rather than behind tabs: a
 * form for somebody who is describing a project, a phone number for somebody whose question
 * is one sentence, an email address for somebody who wants a paper trail, and an address for
 * somebody who would rather come in.
 *
 * The address is the NAP from `src/content/business.ts`, the only copy of it in the codebase,
 * so this page, the footer and the Event Space structured data cannot disagree. Matching the
 * Google Business Profile character for character is what the local ranking signal is built
 * from, and this page is one of the two places a search engine looks for it.
 *
 * The Event Space enquiry is deliberately not here. A booking needs a date, a head count and
 * a purpose, and that form lives on the page where somebody has just looked at the room. This
 * page points at it rather than duplicating it, because two enquiry forms on one site is two
 * sets of fields to keep in step and a sender filling in the wrong one.
 *
 * `LocalBusinessSchema` is here rather than on the home page, because this is the page that
 * carries the address, the hours and the map, and structured data describing a place belongs
 * on the page that describes the place. It is the middle of the three nodes that describe
 * Bitnox: the company on `/about`, the premises here, the bookable room on `/event-space`.
 *
 * Only the opening hours are dynamic, because they come from `SiteSettings` and are still an
 * outstanding input. Everything else is prerendered.
 */

const TITLE = "Contact Bitnox Technology Solutions in Abeokuta";

const DESCRIPTION =
  "Talk to Bitnox about software, a website, technology advice or training. Office at Lalubu Street, Oke-Ilewo, Abeokuta, Ogun State. Call +234 813 719 2766 or send an enquiry.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const MAP_QUERY = `${BUSINESS.latitude},${BUSINESS.longitude}`;

export default async function ContactPage() {
  // A cached read, and the same one `OpeningHours` makes further down the page, so awaiting
  // it here costs one query rather than two and does not put the page on a timer.
  const settings = await getSiteSettings();

  return (
    <>
      <LocalBusinessSchema openingHours={settings?.openingHours ?? []} />
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      <section className="pt-section-sm pb-section-sm lg:pt-section">
        <div className="container-page">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-foreground" aria-current="page">
                Contact
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              Contact
            </p>

            <SplitText
              as="h1"
              by="word"
              delay={0.12}
              text={"Tell us what has to change.\nWe read every one."}
              accentLines={[1]}
              className="text-foreground text-display font-semibold"
            />

            <Reveal delay={0.35}>
              <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
                Describe the problem rather than the solution. We reply within one to two working
                days, usually with questions before a figure.
              </p>
            </Reveal>
          </div>

          {/*
           * The four routes in, directly under the hero. This is the page's "something real":
           * a ruled strip of the actual contact details rather than an illustration of a
           * telephone.
           */}
          <Reveal delay={0.5}>
            <div className="border-border divide-border mt-section-sm mx-auto grid max-w-5xl divide-y border-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
              <ContactRoute label="Phone">
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="text-primary">
                  {BUSINESS.phone}
                </a>
              </ContactRoute>

              <ContactRoute label="Email">
                <a href={`mailto:${BUSINESS.email}`} className="text-primary break-all">
                  {BUSINESS.email}
                </a>
              </ContactRoute>

              <ContactRoute label="Office">
                <span className="text-foreground">
                  {BUSINESS.locality}, {BUSINESS.region}
                </span>
              </ContactRoute>

              <ContactRoute label="Courses">
                <a href={EDU_URL} rel="noopener" className="text-primary">
                  Bitnox Education
                </a>
              </ContactRoute>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-section">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <SectionHeading
                  as="h2"
                  eyebrow="Where we are"
                  title="Oke-Ilewo, Abeokuta"
                  description="The office and the Event Space are in the same building on Lalubu Street, beside the Chicken Republic."
                />

                <dl className="border-border mt-10 border-t">
                  <div className="border-border border-b py-5">
                    <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                      Address
                    </dt>
                    <dd className="text-foreground mt-2 text-base">
                      <address className="not-italic">
                        {BUSINESS.streetAddress}
                        <br />
                        {BUSINESS.locality}, {BUSINESS.region}
                        <br />
                        {BUSINESS.country}
                      </address>
                    </dd>
                  </div>

                  <div className="border-border border-b py-5">
                    <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                      Opening hours
                    </dt>
                    <dd className="mt-3">
                      <Suspense fallback={<HoursFallback />}>
                        <OpeningHours />
                      </Suspense>
                    </dd>
                  </div>

                  <div className="border-border border-b py-5">
                    <dt className="text-2xs text-primary font-medium tracking-[0.12em] uppercase">
                      Booking the room
                    </dt>
                    <dd className="text-muted-foreground mt-2 text-sm">
                      The <InlineLink href="/event-space">Event Space</InlineLink> seats{" "}
                      {EVENT_SPACE_CAPACITY}. Bookings go through the form on that page, which asks
                      for the date, the layout and how many people are coming, so the first reply
                      can be an answer.
                    </dd>
                  </div>
                </dl>

                <div className="glass mt-10 aspect-4/3 w-full overflow-hidden rounded-2xl">
                  <iframe
                    title="Map showing the Bitnox office on Lalubu Street, Oke-Ilewo, Abeokuta"
                    src={`https://www.google.com/maps?q=${MAP_QUERY}&hl=en&z=16&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full border-0"
                  />
                </div>

                <p className="text-muted-foreground mt-6 text-sm">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                    rel="noopener"
                    className="text-primary font-medium"
                  >
                    Open in Google Maps
                  </a>{" "}
                  for directions from where you are.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <SectionHeading
                as="h2"
                eyebrow="Send an enquiry"
                title="Five fields, and we take it from there"
                description="The more concrete the message, the more useful the reply. What has to change, who uses it now, and when you need it."
              />

              <ContactForm className="mt-10" />
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="Looking for a course, or for laundry?"
        description="Course dates and enrolment are on Bitnox Education. Laundry and cleaning are on their own site. Both are ours, and both are one click away."
        action={{ label: "Browse courses", href: EDU_URL, external: true }}
        secondaryAction={{ label: "Bitnox Cleaning", href: "/cleaning" }}
      />
    </>
  );
}

function ContactRoute({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-0 py-6 sm:px-6 lg:first:pl-0">
      <p className="text-2xs text-primary mb-2 font-medium tracking-[0.14em] uppercase">{label}</p>
      <p className="text-base">{children}</p>
    </div>
  );
}

function HoursFallback() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading opening hours">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
