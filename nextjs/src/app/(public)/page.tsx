import type { Metadata } from "next";
import { Suspense } from "react";

import { AboutBand } from "@/app/(public)/_home/about-band";
import { ContactBand } from "@/app/(public)/_home/contact-band";
import { EventSpaceBand } from "@/app/(public)/_home/event-space-band";
import { FaqSection } from "@/app/(public)/_home/faq-section";
import { Hero } from "@/app/(public)/_home/hero";
import { LatestPosts } from "@/app/(public)/_home/latest-posts";
import { PortfolioBand } from "@/app/(public)/_home/portfolio-band";
import { ServicesGrid } from "@/app/(public)/_home/services-grid";
import { TestimonialsBand } from "@/app/(public)/_home/testimonials-band";
import { TrainingBand } from "@/app/(public)/_home/training-band";
import { WhyBitnox } from "@/app/(public)/_home/why-bitnox";
import {
  BlogCardGridSkeleton,
  PortfolioGridSkeleton,
  TestimonialGridSkeleton,
} from "@/components/skeleton";

/**
 * The landing page.
 *
 * It covers all four services and carries no laundry or cleaning content of any kind: no
 * copy, no imagery, no link. Cleaning is a real part of the business with its own domain,
 * and the footer's property switcher is the one place on this site that points at it.
 * Mixing it into a page about software is what made the old landing page hard to read and
 * hard to rank.
 *
 * The order answers a first-time visitor's questions in the order they ask them. What does
 * Bitnox build, who are they, why them, what is the Event Space, where are the courses, what
 * have they built, what do clients say, what are they writing about, what do people usually
 * ask, and how do I get in touch.
 *
 * The three database-backed sections sit behind Suspense boundaries. Their reads are cached
 * and tagged, so on a warm cache the whole page prerenders and the boundaries never show;
 * the fallbacks are sized to the real grids, so nothing moves when a cold one fills. The
 * static sections above them are not held up by any of it.
 */

const TITLE = "Custom Software, Web Development and IT Consulting";

const DESCRIPTION =
  "Bitnox Technology Solutions builds custom business software, websites and online stores, advises on technology, and runs professional training for clients in Nigeria, the United Kingdom and beyond. The Bitnox Event Space in Abeokuta seats 60.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <AboutBand />
      <WhyBitnox />

      <Suspense fallback={null}>
        <EventSpaceBand />
      </Suspense>

      <TrainingBand />

      <Suspense fallback={<SectionFallback>{<PortfolioGridSkeleton count={3} />}</SectionFallback>}>
        <PortfolioBand />
      </Suspense>

      <Suspense
        fallback={<SectionFallback>{<TestimonialGridSkeleton count={3} />}</SectionFallback>}
      >
        <TestimonialsBand />
      </Suspense>

      <Suspense fallback={<SectionFallback>{<BlogCardGridSkeleton count={3} />}</SectionFallback>}>
        <LatestPosts />
      </Suspense>

      <FaqSection />
      <ContactBand />
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
