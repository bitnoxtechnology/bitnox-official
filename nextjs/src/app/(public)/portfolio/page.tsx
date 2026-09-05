import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PortfolioResults } from "@/app/(public)/portfolio/_sections/portfolio-results";
import { Reveal, SplitText } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { CTABand } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { PortfolioGridSkeleton } from "@/components/skeleton";

/**
 * The portfolio index.
 *
 * A static shell with a dynamic list inside it, the same arrangement as the blog index. The
 * hero and the closing band are prerendered; the filter strip and the grid read
 * `searchParams`, so they sit behind a Suspense boundary, and the read behind them is cached
 * under the `portfolio` tag so publishing a project updates this page and the landing band in
 * one call.
 *
 * The page exists because until now the work only appeared as three cards on the landing
 * page. Every project having a URL of its own is what makes the work indexable, linkable from
 * a service page and sendable in a proposal, which is most of what a portfolio is for.
 */

const TITLE = "Portfolio: software, websites and systems we have built";

const DESCRIPTION =
  "Case studies from Bitnox Technology Solutions. What the problem was, what was built, and what changed afterwards, across custom software, websites, IT consulting and training.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  openGraph: { url: "/portfolio", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function PortfolioPage({ searchParams }: PageProps<"/portfolio">) {
  return (
    <>
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Portfolio", path: "/portfolio" },
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
                Portfolio
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <SplitText
              as="h1"
              by="word"
              delay={0.15}
              text={"The work, and what\nchanged because of it."}
              accentLines={[1]}
              className="text-foreground text-display font-semibold"
            />

            <Reveal delay={0.35}>
              <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
                Each project page says what the problem was, what was built, and what the client
                could do afterwards that they could not before.
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <ActionButton href="/contact">Start a project</ActionButton>
                <ActionButton href="/services" variant="outline">
                  What we do
                </ActionButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Suspense fallback={<ResultsFallback />}>
        <Results searchParams={searchParams} />
      </Suspense>

      <CTABand
        title="Yours would be the next one"
        description="Tell us what has to change and who uses the thing today. We will come back with questions first, then a scope, a schedule and a figure."
        action={{ label: "Start a project", href: "/contact" }}
        secondaryAction={{ label: "Read the blog", href: "/blog" }}
      />
    </>
  );
}

async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/portfolio">["searchParams"];
}) {
  const params = await searchParams;
  const raw = params.service;

  // `?service=a&service=b` parses to an array. Taking the first is what a browser form does,
  // and passing the array on would build a query nobody wrote.
  return <PortfolioResults service={Array.isArray(raw) ? raw[0] : raw} />;
}

function ResultsFallback() {
  return (
    <section className="pb-section">
      <div className="container-page">
        <PortfolioGridSkeleton count={6} className="mt-10" />
      </div>
    </section>
  );
}
