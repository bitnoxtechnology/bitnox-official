import type { Metadata } from "next";
import Link from "next/link";

import { CapabilityMatrix } from "@/components/graphics/capability-matrix";
import { ServiceGraphic } from "@/components/graphics/service-graphics";
import { Reveal, SplitText, StaggerGroup } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { CTABand, InlineLink, SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { LogoMarquee } from "@/components/site/logo-marquee";
import { SERVICE_ICONS } from "@/components/site/service-icons";
import { SplitSection } from "@/components/site/split-section";
import { EDU_URL } from "@/content/properties";
import { SERVICES, servicePath } from "@/content/services";

/**
 * The services hub.
 *
 * Its job is to route, and to make the shape of the business legible: what Bitnox does, and
 * the named work inside each one. A visitor who arrived on a search for cybersecurity or
 * digital marketing has to be able to see which page holds what they came for.
 *
 * The services are alternating bands rather than a grid of cards. A card grid gives every
 * service the same shape and the same two sentences, which is the layout that makes a page
 * look assembled; a band gives each one a turn, room for its full capability list, and the
 * drawn interface from its own page beside it. Somebody who scrolls this page has seen the
 * dashboard, the storefront, the audit report and the syllabus before they have clicked
 * anything, which is a far better answer to "what do you actually do" than a stack of
 * paragraphs.
 *
 * The hero is the landing page's hero: centred type, one lead, two calls to action, and the
 * client marks underneath. Every public page opens this way.
 *
 * The matrix below the bands is the one place on the site that states the information
 * architecture outright. It exists because the decision is not self-evident: somebody looking
 * for cloud hosting would reasonably expect a cloud page, and showing them the column it lives
 * in costs less than making them search for it.
 */

const TITLE = "Software, Web, IT Consulting and Technology Training";

const DESCRIPTION =
  "What Bitnox does, and the work inside each one. Custom software and business systems, websites and online stores, technology advice and cybersecurity, and professional training.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: { url: "/services", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * Sectors the work lands in.
 *
 * Named rather than illustrated, because ten icons of a hospital and a lorry is exactly the
 * stock decoration this page is built to avoid. They are also real search terms: somebody
 * looking for a company that has built for a pharmacy wants to see the word pharmacy.
 */
const SECTORS = [
  "Retail and wholesale",
  "Education and training",
  "Healthcare and pharmacy",
  "Logistics and haulage",
  "Real estate",
  "Hospitality and food",
  "Financial services",
  "Professional services",
  "Manufacturing",
  "Public sector and NGOs",
];

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
      />

      <section className="pt-section-sm pb-section lg:pt-section">
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
                Services
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <SplitText
              as="h1"
              by="word"
              delay={0.15}
              text={"What Bitnox builds, advises on\nand teaches."}
              accentLines={[1]}
              className="text-foreground text-display font-semibold"
            />

            <Reveal delay={0.35}>
              <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
                Most projects start in one service and end up touching a second, so each page below
                says what the work covers, how the engagement runs and what you have at the end of
                it.
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <ActionButton href="/contact">Start a project</ActionButton>
                <ActionButton href="/portfolio" variant="outline">
                  See our work
                </ActionButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.6}>
            <LogoMarquee className="mt-section-sm" />
          </Reveal>
        </div>
      </section>

      {SERVICES.map((service, index) => {
        const Icon = SERVICE_ICONS[service.slug];

        return (
          <SplitSection
            key={service.slug}
            id={service.slug}
            // Alternating, so a run of bands does not read as one repeated template.
            reverse={index % 2 === 1}
            eyebrow={`0${index + 1} / ${service.tagline}`}
            title={
              <span className="flex items-start gap-4">
                <Icon className="text-primary mt-1.5 size-7 shrink-0" aria-hidden />
                {service.name}
              </span>
            }
            description={service.summary}
            media={<ServiceGraphic slug={service.slug} variant="lead" />}
          >
            <ul className="border-border mt-10 grid border-t sm:grid-cols-2">
              {service.capabilities.map((capability) => (
                <li
                  key={capability}
                  // Five capabilities in two columns leaves a half-width rule under the last
                  // one. Spanning it closes the list with a full rule instead.
                  className="border-border text-muted-foreground border-b py-3 pr-6 text-sm last:sm:col-span-2"
                >
                  {capability}
                </li>
              ))}
            </ul>

            <ActionButton href={servicePath(service.slug)} className="mt-10">
              Read about {service.name}
            </ActionButton>
          </SplitSection>
        );
      })}

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Where things live"
            title="Cloud, marketing and security sit inside a service"
            description="Three of the things people search for are not pages of their own here. They are named parts of the service that owns them, because none is a project on its own and separating them would mean quoting twice for one piece of work. They are picked out in the grid below."
          />

          <div className="mt-section-sm">
            <CapabilityMatrix />
          </div>

          <Reveal delay={0.1}>
            <p className="text-muted-foreground measure mt-8 text-sm">
              In-person training runs in the{" "}
              <InlineLink href="/event-space">Bitnox Event Space</InlineLink>, which seats sixty and
              can also be booked for conferences, workshops and meetings. Course listings, dates and
              enrolment are on <InlineLink href={EDU_URL}>Bitnox Education</InlineLink>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Who we build for"
            title="Sectors this work usually lands in"
            description="The work is the same shape in most of them: records that live in three places, a website nobody can edit, and a decision about what to replace first."
          />

          <StaggerGroup asChild selector="li" className="border-border mt-section-sm border-t">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-5">
              {SECTORS.map((sector) => (
                <li
                  key={sector}
                  className="border-border text-foreground border-b py-4 pr-6 text-base"
                >
                  {sector}
                </li>
              ))}
            </ul>
          </StaggerGroup>
        </div>
      </section>

      <CTABand
        title="Not sure which service you need?"
        description="Describe the problem rather than the solution. We will say which service it falls under, and tell you when the answer is that you do not need us yet."
        action={{ label: "Talk to us", href: "/contact" }}
        secondaryAction={{ label: "Read the blog", href: "/blog" }}
      />
    </>
  );
}
