import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { SERVICE_ICONS } from "@/components/site/service-icons";
import { SERVICE_BY_SLUG, type Service, servicePath } from "@/content/services";

/**
 * The two services this one leads to, as ruled rows.
 *
 * Internal linking is a ranking input, so every service page links to two others and says why
 * somebody reading this page would want that one. What changed is the shape: two cards side
 * by side gave a footnote the same visual weight as the six deliverables above it, and put
 * two more rounded boxes at the bottom of a page that already ends in a call to action.
 *
 * A full-width ruled row is quieter and reads better. The name goes large, the reason sits
 * beside it, the whole row is the link, and the arrow moves on hover so the row has an
 * obvious affordance without a border around it.
 *
 * Two rather than all three. The fourth is one click away in the nav and on the hub, and a
 * page that ends by offering everything else it could have been has no direction.
 */
export function RelatedServices({ service }: { service: Service }) {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Where this leads"
          title="What most clients ask about next"
          description="Projects rarely stay inside one service. These are the two that usually come up alongside this one."
        />

        <StaggerGroup asChild selector="li" className="mt-section-sm border-border border-t">
          <ul>
            {service.related.map((related) => {
              const target = SERVICE_BY_SLUG[related.slug];
              const Icon = SERVICE_ICONS[related.slug];

              return (
                <li key={related.slug} className="border-border border-b">
                  <Link
                    href={servicePath(related.slug)}
                    className="group/row hover:bg-muted/40 -mx-4 flex flex-col gap-4 px-4 py-8 transition-colors sm:flex-row sm:items-center sm:gap-10"
                  >
                    <div className="flex items-center gap-4 sm:w-2/5">
                      <Icon className="text-primary size-5 shrink-0" aria-hidden />
                      <h3 className="text-foreground text-xl font-semibold sm:text-2xl">
                        {target.name}
                      </h3>
                    </div>

                    <p className="text-muted-foreground flex-1 text-sm">{related.note}</p>

                    <ArrowRight
                      className="text-primary size-5 shrink-0 transition-transform duration-300 group-hover/row:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
