import type { Metadata } from "next";
import Link from "next/link";

import { PlanTimeline } from "@/components/graphics/plan-timeline";
import { ScopeSheet } from "@/components/graphics/scope-sheet";
import { GraphicCaption } from "@/components/graphics/window-frame";
import { Reveal, SplitText, StaggerGroup } from "@/components/motion";
import { AboutPageSchema } from "@/components/seo/AboutPageSchema";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { CTABand, SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { RichText } from "@/components/site/rich-text";
import { SERVICE_ICONS } from "@/components/site/service-icons";
import { SplitSection } from "@/components/site/split-section";
import {
  ABOUT_FIRST_STEPS,
  ABOUT_HERO,
  ABOUT_LOCATION,
  ABOUT_PRINCIPLES,
  ABOUT_SEO,
  ABOUT_STORY,
} from "@/content/about";
import { BUSINESS } from "@/content/business";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { SERVICES, servicePath } from "@/content/services";

/**
 * About.
 *
 * The page a prospective client reads after the service page and before the enquiry, so it
 * answers the questions that decide whether they send one: how the company works, what it
 * will say no to, what the first two conversations look like, and where it is.
 *
 * It carries the `Organization` block. That node's `@id` is referenced by the service pages,
 * every blog post and the Event Space, so it is emitted once, here, on the page it actually
 * describes, rather than repeated in the root layout on every URL on the site.
 *
 * There are no counts on this page. The version it replaces opened with eight years, 180
 * projects and 100 clients, none of which came from anywhere, and the standards call that
 * fabricated social proof. What is here instead is a set of commitments that can be checked
 * against how an engagement actually runs, which is worth more to somebody deciding.
 *
 * The two graphics are the signed scope and the order of work, borrowed from the service
 * pages on purpose: they are the two documents this page makes claims about, so the claim
 * and the artefact are on screen together.
 */

export const metadata: Metadata = {
  title: ABOUT_SEO.title,
  description: ABOUT_SEO.description,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: ABOUT_SEO.title, description: ABOUT_SEO.description },
  twitter: { title: ABOUT_SEO.title, description: ABOUT_SEO.description },
};

export default function AboutPage() {
  return (
    <>
      <OrganizationSchema />
      <AboutPageSchema />
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
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
                About
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              {ABOUT_HERO.eyebrow}
            </p>

            <SplitText
              as="h1"
              by="word"
              delay={0.12}
              text={ABOUT_HERO.headline}
              accentLines={[1]}
              className="text-foreground text-display font-semibold"
            />

            <Reveal delay={0.35}>
              <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
                {ABOUT_HERO.lead}
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <ActionButton href="/contact">Talk to us</ActionButton>
                <ActionButton href="/portfolio" variant="outline">
                  See our work
                </ActionButton>
              </div>
            </Reveal>
          </div>

          {/*
           * The real thing under the hero, per the page composition rule. On this page it is
           * the story itself set at reading measure, because the subject of an about page is
           * prose and a drawn interface here would be decoration.
           */}
          <Reveal delay={0.55}>
            <div className="border-border mt-section-sm mx-auto max-w-3xl space-y-6 border-t pt-10">
              {ABOUT_STORY.map((paragraph, index) => (
                <p key={index} className="text-muted-foreground text-lead">
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title="Four services, and the work inside each one"
            description="Most projects start in one and end up touching a second, which is why each has a page of its own rather than a paragraph here."
          />

          <StaggerGroup asChild selector="li" className="border-border mt-section-sm border-t">
            <ul>
              {SERVICES.map((service) => {
                const Icon = SERVICE_ICONS[service.slug];

                return (
                  <li key={service.slug} className="border-border border-b">
                    <Link
                      href={servicePath(service.slug)}
                      className="group hover:bg-muted/40 -mx-4 flex flex-wrap items-baseline gap-x-8 gap-y-2 px-4 py-7 transition-colors sm:flex-nowrap"
                    >
                      <span className="flex min-w-0 items-baseline gap-4 sm:w-2/5">
                        <Icon className="text-primary size-5 shrink-0 translate-y-1" aria-hidden />
                        <span className="text-foreground group-hover:text-primary text-xl font-semibold transition-colors sm:text-2xl">
                          {service.name}
                        </span>
                      </span>
                      <span className="text-muted-foreground measure flex-1 text-base">
                        {service.summary}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </StaggerGroup>
        </div>
      </section>

      <SplitSection
        eyebrow="How we work"
        title="What you can hold us to"
        description="Six commitments that can be checked against how an engagement actually runs, rather than six words about our values."
        media={
          <figure>
            <ScopeSheet />
            <GraphicCaption>
              An illustrative scope sheet. Every quote arrives with what is included, what is not,
              and what is deliberately left to a later phase.
            </GraphicCaption>
          </figure>
        }
      >
        <dl className="border-border mt-10 border-t">
          {ABOUT_PRINCIPLES.map((principle) => (
            <div key={principle.title} className="border-border border-b py-5">
              <dt className="text-foreground text-base font-medium">{principle.title}</dt>
              <dd className="text-muted-foreground mt-1.5 text-sm">{principle.body}</dd>
            </div>
          ))}
        </dl>
      </SplitSection>

      <SplitSection
        reverse
        eyebrow="Getting started"
        title="What the first two weeks look like"
        description="Nothing is built until the scope is written down and agreed. That is not a formality: the disagreements that end projects are almost always about something nobody put in writing."
        media={
          <figure>
            <PlanTimeline />
            <GraphicCaption>
              An illustrative order of work from a consulting engagement. Cheap fixes are scheduled
              first, so the long piece is not blocking them.
            </GraphicCaption>
          </figure>
        }
      >
        <StaggerGroup asChild selector="li">
          <ol className="border-border mt-10 ml-5 grid gap-8 border-l pl-8 sm:ml-0">
            {ABOUT_FIRST_STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span
                  aria-hidden
                  className="bg-background text-primary border-border absolute top-0 -left-13 grid size-9 place-items-center rounded-full border text-sm font-medium"
                >
                  {index + 1}
                </span>
                <h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground measure mt-2 text-base">{step.body}</p>
              </li>
            ))}
          </ol>
        </StaggerGroup>
      </SplitSection>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Where we are"
            title={`Abeokuta, Ogun State, and a room that seats ${EVENT_SPACE_CAPACITY}`}
            description={ABOUT_LOCATION}
          />

          <div className="mt-section-sm border-border grid gap-x-16 gap-y-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-2xs text-primary mb-3 font-medium tracking-[0.14em] uppercase">
                Office
              </h3>
              <address className="text-muted-foreground text-base not-italic">
                {BUSINESS.streetAddress}
                <br />
                {BUSINESS.locality}, {BUSINESS.region}
                <br />
                {BUSINESS.country}
              </address>
            </div>

            <div>
              <h3 className="text-2xs text-primary mb-3 font-medium tracking-[0.14em] uppercase">
                Event Space
              </h3>
              <p className="text-muted-foreground text-base">
                The same building holds the{" "}
                <Link href="/event-space" className="text-primary font-medium">
                  Bitnox Event Space
                </Link>
                , which seats {EVENT_SPACE_CAPACITY} and is booked for conferences, meetings,
                workshops and classes.
              </p>
            </div>

            <div>
              <h3 className="text-2xs text-primary mb-3 font-medium tracking-[0.14em] uppercase">
                Getting in touch
              </h3>
              <p className="text-muted-foreground text-base">
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="text-primary">
                  {BUSINESS.phone}
                </a>
                <br />
                <a href={`mailto:${BUSINESS.email}`} className="text-primary">
                  {BUSINESS.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="Tell us what has to change"
        description="Describe the problem rather than the solution. We will say which service it falls under, what it usually takes, and when the answer is that you should buy something instead of building it."
        action={{ label: "Start a conversation", href: "/contact" }}
        secondaryAction={{ label: "Read about the services", href: "/services" }}
      />
    </>
  );
}
