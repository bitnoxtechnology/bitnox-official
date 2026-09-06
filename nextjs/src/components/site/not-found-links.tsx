import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { InlineLink } from "@/components/site/inline-link";
import { EDU_URL } from "@/content/properties";

/**
 * Where to go instead, on a 404.
 *
 * A 404 on a page that once ranked is somebody who was looking for something real, and two
 * buttons saying "go home" hands them back to a menu to search again. This is the list of
 * everywhere worth going, on the page they landed on, so the recovery is one click rather
 * than three.
 *
 * The services are read from the content module rather than listed here, so a service added
 * later appears on the 404 without anybody remembering to add it. The courses link is
 * external and deliberately present: somebody arriving on a dead URL while looking for
 * training is on the wrong domain and has no way of knowing it.
 *
 * Full-width ruled rows rather than a grid of cards. That is the substitution the page
 * composition rule names for a set of links that go elsewhere, and it lets each row say why
 * a reader would follow it.
 */

const DESTINATIONS = [
  { href: "/services", label: "Services", note: "What Bitnox builds, advises on and teaches" },
  { href: "/event-space", label: "Event Space", note: "The room in Abeokuta, and how to book it" },
  { href: "/portfolio", label: "Portfolio", note: "Work we have finished, and what changed" },
  { href: "/blog", label: "Blog", note: "Working notes from the projects" },
  { href: "/about", label: "About", note: "How we work, and what we will say no to" },
  { href: "/contact", label: "Contact", note: "The office, the phone number and the form" },
];

export function NotFoundLinks() {
  return (
    <section className="pb-section">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xs text-primary mb-6 text-center font-medium tracking-[0.14em] uppercase">
            Try one of these
          </h2>

          <ul className="border-border border-t">
            {DESTINATIONS.map((destination) => (
              <li key={destination.href} className="border-border border-b">
                <Link
                  href={destination.href}
                  className="group hover:bg-muted/40 -mx-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 px-4 py-5 transition-colors"
                >
                  <span className="text-foreground group-hover:text-primary text-lg font-medium transition-colors sm:w-40">
                    {destination.label}
                  </span>
                  <span className="text-muted-foreground flex-1 text-sm">{destination.note}</span>
                </Link>
              </li>
            ))}

            <li className="border-border border-b">
              <a
                href={EDU_URL}
                rel="noopener"
                className="group hover:bg-muted/40 -mx-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 px-4 py-5 transition-colors"
              >
                <span className="text-primary flex items-center gap-1.5 text-lg font-medium sm:w-40">
                  Courses
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
                <span className="text-muted-foreground flex-1 text-sm">
                  Course dates and enrolment are on Bitnox Education
                </span>
              </a>
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 text-center text-sm">
            Individual services live under{" "}
            <span className="text-foreground font-mono text-xs">/services/</span>, and the ones we
            offer are listed on the <InlineLink href="/services">services page</InlineLink>.
          </p>
        </div>
      </div>
    </section>
  );
}
