import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { NewsletterForm } from "@/components/forms/newsletter-form";
import { ConsentSettingsLink } from "@/components/site/consent-banner";
import { analyticsContainerId } from "@/components/site/google-tag-manager";
import { PropertyList } from "@/components/site/property-switcher";
import { BUSINESS } from "@/content/business";
import { EDU_URL } from "@/content/properties";
import { SERVICES, servicePath } from "@/content/services";
import { cn } from "@/lib/utils";

/**
 * The footer.
 *
 * It carries the NAP block, which is the only reason it is more than a list of links. The
 * name, address and phone number here have to match the Google Business Profile character
 * for character, because the local ranking signal the Event Space page depends on is built
 * from agreement between the two. They come from `src/content/business.ts`, which is the one
 * copy in the codebase, so the footer cannot drift from the contact page or the structured
 * data.
 *
 * Cleaning appears here and nowhere else on the site. The landing page carries no laundry or
 * cleaning content of any kind, so this list is the one place a visitor who came for that
 * finds the way to the right domain.
 */

const COMPANY_LINKS = [
  { href: "/event-space", label: "Event Space" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

/**
 * The copyright line carries no year, and that is deliberate.
 *
 * `new Date()` cannot be read while a page is prerendered, because the value changes between
 * renders and Cache Components will not bake a moment into a static page. The obvious fix is
 * to read it inside a `"use cache"` function, but the shortest cache profile in a page's
 * tree is the one that governs the page, so a footer on a daily profile would put every
 * public page on a daily timer. That is time-based revalidation reintroduced through the
 * footer, in an application whose whole caching strategy is tag invalidation.
 *
 * A copyright notice does not need a year to be a copyright notice. Dropping it costs
 * nothing, keeps every page invalidated only by tag, and removes the one failure mode a
 * cached year has, which is showing the wrong one every January.
 */
export async function Footer() {
  // Only worth offering where there is a container to consent to. See `ConsentDefaults`.
  const analyticsConfigured = Boolean(await analyticsContainerId());

  return (
    <footer className="border-border/60 mt-section border-t">
      <div className="container-page py-section-sm">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="grid gap-6 lg:col-span-4">
            <Link href="/" className="inline-flex" aria-label="Bitnox, home">
              <Image
                src="/logo.svg"
                alt="Bitnox Technology Solutions"
                width={345}
                height={85}
                className="h-7 w-auto"
              />
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm">
              Software, websites, IT consulting and technology training for clients in Nigeria, the
              United Kingdom and beyond.
            </p>

            <address className="grid gap-3 text-sm not-italic">
              <p className="text-muted-foreground flex gap-2.5">
                <MapPin className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {BUSINESS.streetAddress},<br />
                  {BUSINESS.locality}, {BUSINESS.region}, {BUSINESS.country}
                </span>
              </p>
              <p className="flex gap-2.5">
                <Phone className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                <a
                  href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {BUSINESS.phone}
                </a>
              </p>
              <p className="flex gap-2.5">
                <Mail className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {BUSINESS.email}
                </a>
              </p>
            </address>
          </div>

          <nav className="grid gap-10 sm:grid-cols-2 lg:col-span-4" aria-label="Footer">
            <div>
              <h2 className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
                Services
              </h2>
              <ul className="grid gap-2.5">
                {SERVICES.map((service) => (
                  <li key={service.slug}>
                    <FooterLink href={servicePath(service.slug)}>{service.name}</FooterLink>
                  </li>
                ))}
                <li>
                  <a
                    href={EDU_URL}
                    rel="noopener"
                    className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
                  >
                    Course catalogue
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
                Company
              </h2>
              <ul className="grid gap-2.5">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="grid gap-10 lg:col-span-4">
            <div>
              <h2 className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
                Newsletter
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                What we have built, what we learned building it, and news from the Event Space. A
                few times a month.
              </p>
              <NewsletterForm source="footer" />
            </div>

            <div>
              <h2 className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
                Bitnox properties
              </h2>
              <PropertyList />
            </div>
          </div>
        </div>

        <div className="border-border/60 mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            Copyright {BUSINESS.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href} className="text-xs">
                  {link.label}
                </FooterLink>
              </li>
            ))}
            {analyticsConfigured ? (
              <li>
                <ConsentSettingsLink className="text-muted-foreground hover:text-primary text-xs transition-colors" />
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground hover:text-primary text-sm transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}
