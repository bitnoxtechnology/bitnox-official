import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StaggerGroup } from "@/components/motion";
import { GlassCard, SectionHeading } from "@/components/site";
import { SERVICE_ICONS } from "@/components/site/service-icons";
import { SERVICES, servicePath } from "@/content/services";

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
 * The icons come from `components/site/service-icons.ts`, which the services hub reads as
 * well. They are not in the content module: that one is text, read by the nav, the footer and
 * the sitemap, none of which draw anything.
 */
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
              const Icon = SERVICE_ICONS[service.slug];

              return (
                <li key={service.slug} className="h-full">
                  <GlassCard asChild interactive padding="lg" className="h-full bg-transparent!">
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
