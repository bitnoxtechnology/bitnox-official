import Link from "next/link";

import { ServiceGraphic } from "@/components/graphics/service-graphics";
import { Reveal, SplitText } from "@/components/motion";
import { ActionButton } from "@/components/site/action-button";
import type { Service } from "@/content/services";

/**
 * The top of a service page, built to the same shape as the landing page hero.
 *
 * Centred headline, one lead paragraph on the page's centre line, two calls to action, and
 * then something real underneath. On the landing page that last thing is the row of client
 * marks; here it is the drawn interface for this service, which does the same job of giving
 * the eye somewhere to land after the type and of proving there is substance below the fold.
 *
 * The `h1` is the headline from the content module rather than the service name. The name is
 * already in the title tag, the breadcrumb, the nav and the URL, and spending the largest
 * type on the page repeating it wastes the one line a visitor is certain to read.
 *
 * The breadcrumb is real markup rather than only structured data. `BreadcrumbListSchema` on
 * the page describes this trail, and Google's guidance is that the markup should reflect
 * something a reader can see, so the two are built from the same three steps.
 *
 * The graphic is capped at five columns of measure rather than running the full eighty
 * rem. A dashboard stretched to 1280px stops reading as a screen and starts reading as
 * wallpaper, and the hero copy above it is centred on a narrower column than that anyway.
 */
export function ServiceHero({ service }: { service: Service }) {
  return (
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
            <li>
              <Link href="/services" className="hover:text-foreground transition-colors">
                Services
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground" aria-current="page">
              {service.name}
            </li>
          </ol>
        </nav>

        <div className="mx-auto mt-10 max-w-4xl text-center">
          <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
            {service.hero.eyebrow}
          </p>

          <SplitText
            as="h1"
            by="word"
            delay={0.1}
            text={service.hero.headline}
            className="text-foreground text-display font-semibold"
          />

          <Reveal delay={0.3}>
            <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
              {service.hero.lead}
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <ActionButton href={service.cta.action.href} external={service.cta.action.external}>
                {service.cta.action.label}
              </ActionButton>
              {service.cta.secondaryAction ? (
                <ActionButton
                  href={service.cta.secondaryAction.href}
                  external={service.cta.secondaryAction.external}
                  variant="outline"
                >
                  {service.cta.secondaryAction.label}
                </ActionButton>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.6} className="mt-section-sm mx-auto max-w-5xl">
          <ServiceGraphic slug={service.slug} variant="lead" />
        </Reveal>
      </div>
    </section>
  );
}

/**
 * What the service covers, as a rule across the page.
 *
 * The five capabilities used to be a row of pills under the hero. Pills are a card at small
 * scale: five rounded boxes saying five things of equal weight. A ruled strip says the same
 * five things, takes a third of the height, and reads as part of the page's structure rather
 * than as chips somebody scattered under a headline.
 *
 * It sits immediately below the hero because these five lines are where the search terms
 * that are not pages of their own actually live, and somebody who arrived looking for one of
 * them should not have to scroll to be reassured.
 */
export function CapabilityStrip({ service }: { service: Service }) {
  return (
    // No padding of its own below the rule. The section under it opens with a full
    // `section-y`, and two of those back to back is a screen and a half of nothing.
    <section>
      <div className="container-page">
        <h2 className="sr-only">What {service.name} covers</h2>
        {/* Five columns or one, never three. `divide-x` draws its rule with a left border on
            every child after the first, which in a wrapped grid puts a rule down the left of
            the item that starts the second row. With one row of five, or a plain stack, the
            rules land where they are meant to. */}
        <ul className="border-border divide-border grid divide-y border-y lg:grid-cols-5 lg:divide-x lg:divide-y-0">
          {service.capabilities.map((capability) => (
            <li
              key={capability}
              className="text-muted-foreground px-1 py-4 text-sm lg:px-6 lg:py-6"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
