import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { HowItRuns } from "@/app/(public)/services/_sections/how-it-runs";
import { ProblemOutcome } from "@/app/(public)/services/_sections/problem-outcome";
import { RelatedServices } from "@/app/(public)/services/_sections/related-services";
import { ServiceFaqs } from "@/app/(public)/services/_sections/service-faqs";
import { CapabilityStrip, ServiceHero } from "@/app/(public)/services/_sections/service-hero";
import { ServiceReading } from "@/app/(public)/services/_sections/service-reading";
import { ServiceWork } from "@/app/(public)/services/_sections/service-work";
import { WhatIsIncluded } from "@/app/(public)/services/_sections/what-is-included";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { CTABand } from "@/components/site";
import { BlogCardGridSkeleton, PortfolioGridSkeleton } from "@/components/skeleton";
import { SERVICES, SERVICE_BY_SLUG, isServiceSlug, servicePath } from "@/content/services";

/**
 * One template, one page per service.
 *
 * Every word on these pages comes from `src/content/services.ts`. The template decides the
 * order of the sections, the heading ranks and the spacing; it holds no copy of its own, so
 * a correction to any service is a content edit rather than a React edit, and the pages
 * cannot drift into different shapes.
 *
 * The order answers the questions a buyer asks, in the order they ask them. What is this and
 * is it for me, do you understand my situation, what exactly do I get, how does the work run,
 * have you done it before, what have you written about it, what are the awkward questions,
 * what else might I need, and how do I start.
 *
 * The two database-backed sections sit behind Suspense boundaries and return null when they
 * find nothing, which is the state the site launches in. Everything above them is static and
 * is not held up by either.
 *
 * There are two rounded panels on the finished page: the closing call to action, and each
 * frame around a drawn interface. Everything else is set on the page ground and separated by
 * rules. That is the rule the rest of the public pages follow as they are built.
 */

/**
 * Every service slug, prerendered at build.
 *
 * `dynamicParams = false` would be the natural companion to a fixed set of slugs, and Cache
 * Components rejects that segment config outright. Anything outside the set therefore
 * reaches the page at request time instead of being refused by the router, which is what the
 * `isServiceSlug` check in the component is for.
 */
export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isServiceSlug(slug)) return {};

  const service = SERVICE_BY_SLUG[slug];
  const path = servicePath(slug);

  return {
    title: service.seo.title,
    description: service.seo.description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title: service.seo.title,
      description: service.seo.description,
    },
    twitter: { title: service.seo.title, description: service.seo.description },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;

  // Both the 404 for a slug that is not a service, and the narrowing from the route's
  // `string` to the `ServiceSlug` the record is indexed with.
  if (!isServiceSlug(slug)) notFound();

  const service = SERVICE_BY_SLUG[slug];

  return (
    <>
      <ServiceSchema service={service} />
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: servicePath(service.slug) },
        ]}
      />

      <ServiceHero service={service} />
      <CapabilityStrip service={service} />
      <ProblemOutcome service={service} />
      <WhatIsIncluded service={service} />
      <HowItRuns service={service} />

      <Suspense fallback={<SectionFallback>{<PortfolioGridSkeleton count={3} />}</SectionFallback>}>
        <ServiceWork service={service} />
      </Suspense>

      <Suspense fallback={<SectionFallback>{<BlogCardGridSkeleton count={3} />}</SectionFallback>}>
        <ServiceReading service={service} />
      </Suspense>

      <ServiceFaqs service={service} />
      <RelatedServices service={service} />

      <CTABand
        title={service.cta.title}
        description={service.cta.description}
        action={service.cta.action}
        secondaryAction={service.cta.secondaryAction}
      />
    </>
  );
}

/** The section frame the skeletons need, so a fallback occupies the same band as its section. */
function SectionFallback({ children }: { children: React.ReactNode }) {
  return (
    <section className="section-y">
      <div className="container-page">{children}</div>
    </section>
  );
}
