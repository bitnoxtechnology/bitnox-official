import Link from "next/link";
import { ArrowRight, Code2, Compass, GraduationCap, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StaggerGroup } from "@/components/motion";
import { GlassCard, SectionHeading } from "@/components/site";
import { SERVICES, servicePath } from "@/content/services";
import type { ServiceSlug } from "@/lib/constants";

/**
 * The four services.
 *
 * Each card carries the name, what it covers, and three of the capabilities inside it, then
 * links to the page that has the rest. A card with an icon, two words and a sentence of
 * filler tells a visitor nothing, so these say enough that somebody could decide from the
 * grid alone whether the service page is worth opening.
 *
 * Cloud infrastructure, digital marketing and cybersecurity appear in the capability lines
 * rather than as cards of their own, which is where the keywords live without the site
 * pretending to have seven services.
 *
 * The icons are here rather than in `src/content/services.ts`. That module is text, read by
 * the nav, the footer and the sitemap, none of which draw anything, and putting a component
 * reference in it would drag Lucide into all three.
 */
const ICONS: Record<ServiceSlug, LucideIcon> = {
  "software-development": Code2,
  "web-development": Globe,
  "it-consulting": Compass,
  "technology-training": GraduationCap,
};

export function ServicesGrid() {
  return (
    <section id="services" className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="What we do"
          title="Four services, and the work that sits inside each one"
          description="Most projects start in one of these and end up touching two. The pages below say what each covers, how the work runs and what you get at the end."
        />

        <StaggerGroup asChild className="mt-section-sm grid gap-6 md:grid-cols-2">
          <ul>
            {SERVICES.map((service) => {
              const Icon = ICONS[service.slug];

              return (
                <li key={service.slug} className="h-full">
                  <GlassCard asChild interactive padding="lg" className="h-full">
                    <Link href={servicePath(service.slug)} className="flex h-full flex-col">
                      <Icon className="text-primary size-6" aria-hidden />

                      <h3 className="text-foreground mt-5 text-2xl font-semibold">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground mt-3 text-sm">{service.summary}</p>

                      <ul className="mt-5 grid gap-2">
                        {service.capabilities.slice(0, 3).map((capability) => (
                          <li key={capability} className="text-muted-foreground text-sm">
                            {capability}
                          </li>
                        ))}
                      </ul>

                      <span className="text-primary mt-auto flex items-center gap-1.5 pt-6 text-sm font-medium">
                        {service.name}
                        <ArrowRight className="size-4" aria-hidden />
                      </span>
                    </Link>
                  </GlassCard>
                </li>
              );
            })}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
