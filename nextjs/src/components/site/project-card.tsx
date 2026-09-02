import Image from "next/image";
import Link from "next/link";

import { GlassCard } from "@/components/site/glass-card";
import { Badge } from "@/components/ui/badge";
import { serviceName } from "@/content/services";
import type { ProjectCardDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * A project in a list.
 *
 * The client name is shown when there is one and quietly omitted when there is not, because
 * plenty of work is under an agreement that does not allow the name. An empty "Client:"
 * label draws attention to the gap.
 *
 * Services are shown as their proper names rather than their slugs, read from the same
 * content module the service pages use, so a project tagged `it-consulting` says
 * "IT Consulting" here and on its own page without either of them holding a second copy of
 * the mapping.
 */
export function ProjectCard({
  project,
  priority = false,
  className,
}: {
  project: ProjectCardDTO;
  priority?: boolean;
  className?: string;
}) {
  return (
    <GlassCard asChild interactive padding="none" className={cn("overflow-hidden", className)}>
      <article>
        <Link href={`/portfolio/${project.slug}`} className="flex h-full flex-col">
          {project.coverImage ? (
            <div className="bg-muted relative aspect-16/10 w-full overflow-hidden">
              <Image
                src={project.coverImage.url}
                alt={project.coverImage.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ) : null}

          <div className="flex flex-1 flex-col p-6">
            {project.client ? (
              <p className="text-muted-foreground mb-2 text-xs">{project.client}</p>
            ) : null}

            <h3 className="text-foreground text-xl font-semibold">{project.title}</h3>
            <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">{project.summary}</p>

            {project.services.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2 pt-2">
                {project.services.map((slug) => (
                  <li key={slug}>
                    <Badge variant="secondary">{serviceName(slug)}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Link>
      </article>
    </GlassCard>
  );
}
