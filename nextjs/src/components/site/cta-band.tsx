import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTAAction = {
  label: string;
  href: string;
  /** Set for links leaving this origin, such as the two sister properties. */
  external?: boolean;
};

type CTABandProps = {
  title: ReactNode;
  description?: ReactNode;
  action: CTAAction;
  /** A quieter alternative beside the main action. At most one. */
  secondaryAction?: CTAAction;
  className?: string;
};

/**
 * The band that closes a page: one claim, one thing to do.
 *
 * Every public page ends with one of these, so a visitor who reads to the bottom of the
 * Event Space page, a service page or a blog post always has a next step in the same place.
 *
 * One primary action, at most one secondary. Three buttons of equal weight is the same as
 * none, since the visitor then has to decide instead of act.
 *
 * `data-cta` marks both for `AnalyticsListener`, which is how a click on the band that closes
 * every page is reported without this component or its callers becoming client components.
 */
export function CTABand({ title, description, action, secondaryAction, className }: CTABandProps) {
  return (
    <section className={cn("section-y", className)}>
      <div className="container-page">
        <div className="glass px-gutter py-section-sm rounded-2xl text-center">
          <h2 className="text-foreground text-section mx-auto max-w-2xl font-semibold">{title}</h2>

          {description ? (
            <p className="text-muted-foreground text-lead mt-stack measure mx-auto">
              {description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" data-cta="primary">
              <CTALink action={action} />
            </Button>

            {secondaryAction ? (
              <Button asChild size="lg" variant="outline" data-cta="secondary">
                <CTALink action={secondaryAction} />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * `next/link` prefetches and client-navigates, which is right for this site and wrong for
 * `edu.` and `cleaning.`: they are separate applications on separate origins, and a
 * prefetch of a URL the router cannot handle is a wasted request.
 */
function CTALink({ action }: { action: CTAAction }) {
  if (action.external) {
    return (
      <a href={action.href} rel="noopener">
        {action.label}
      </a>
    );
  }

  return <Link href={action.href}>{action.label}</Link>;
}
