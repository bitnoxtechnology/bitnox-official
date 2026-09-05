import type { Metadata } from "next";
import Link from "next/link";

import { Reveal, SplitText, StaggerGroup } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { CTABand } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import {
  CLEANING_COVERAGE,
  CLEANING_HERO,
  CLEANING_NOTE,
  CLEANING_SEO,
  CLEANING_SUBDOMAIN_CONFIRMED,
} from "@/content/cleaning";
import { CLEANING_URL } from "@/content/properties";

/**
 * The cleaning overview.
 *
 * A signpost rather than a service page, and every decision here follows from that. There is
 * no pricing, no quote form, no detail that could substitute for the subdomain, and no
 * `Service` or `LocalBusiness` structured data: that markup belongs on
 * `cleaning.bitnoxsolution.com`, and emitting it here would put this page in competition with
 * the one it exists to point at.
 *
 * It stays in the sitemap and stays indexable. Somebody searching for laundry in Abeokuta may
 * well land on the main domain, and this page is what routes them. Removing it from the index
 * would orphan them; the canonical is enough to make sure the subdomain, not this page, keeps
 * the ranking signal.
 *
 * The canonical is behind `CLEANING_SUBDOMAIN_CONFIRMED`, which is false until somebody has
 * actually loaded the subdomain. A canonical pointing at a URL that does not resolve would
 * take this page out of the index and put nothing in its place, which is the one outcome
 * worse than splitting the signal.
 *
 * The call to action appears three times: in the hero, after the coverage list and in the
 * closing band. That repetition is the page's whole job.
 */

export const metadata: Metadata = {
  title: CLEANING_SEO.title,
  description: CLEANING_SEO.description,
  alternates: { canonical: CLEANING_SUBDOMAIN_CONFIRMED ? CLEANING_URL : "/cleaning" },
  openGraph: { url: "/cleaning", title: CLEANING_SEO.title, description: CLEANING_SEO.description },
  twitter: {
    card: "summary_large_image",
    title: CLEANING_SEO.title,
    description: CLEANING_SEO.description,
  },
};

export default function CleaningPage() {
  return (
    <>
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Cleaning", path: "/cleaning" },
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
                Cleaning
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              {CLEANING_HERO.eyebrow}
            </p>

            <SplitText
              as="h1"
              by="word"
              delay={0.12}
              text={CLEANING_HERO.headline}
              accentLines={[1]}
              className="text-foreground text-display font-semibold"
            />

            <Reveal delay={0.35}>
              <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
                {CLEANING_HERO.lead}
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <ActionButton href={CLEANING_URL} external>
                  Go to Bitnox Cleaning
                </ActionButton>
                <ActionButton href="/contact" variant="outline">
                  Ask us here instead
                </ActionButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.55}>
            <div className="border-border divide-border mt-section-sm mx-auto grid max-w-5xl divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {CLEANING_COVERAGE.map((item) => (
                <div key={item.title} className="px-0 py-7 sm:px-7 sm:first:pl-0 sm:last:pr-0">
                  <h2 className="text-foreground text-lg font-semibold">{item.title}</h2>
                  <p className="text-muted-foreground mt-2 text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.65}>
            <p className="text-muted-foreground measure mx-auto mt-12 text-center text-base">
              {CLEANING_NOTE}
            </p>
          </Reveal>

          <StaggerGroup className="mt-10 flex justify-center">
            <ActionButton href={CLEANING_URL} external variant="outline">
              See what is covered and book
            </ActionButton>
          </StaggerGroup>
        </div>
      </section>

      <CTABand
        title="Everything about cleaning lives on the cleaning site"
        description="Coverage, what is included, collection times and booking are all kept up to date there rather than repeated here. This page exists to get you across."
        action={{ label: "Open Bitnox Cleaning", href: CLEANING_URL, external: true }}
        secondaryAction={{ label: "Back to the technology site", href: "/" }}
      />
    </>
  );
}
