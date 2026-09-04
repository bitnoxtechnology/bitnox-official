import { StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { ProjectCard } from "@/components/site/project-card";
import type { Service } from "@/content/services";
import { getProjectsByService } from "@/lib/queries/portfolio";

/**
 * Portfolio work tagged with this service.
 *
 * A project carries service slugs on its `services` field, so this is the same rows the
 * portfolio index shows, filtered to the ones that prove what the page above them claims.
 * The read is cached under the `portfolio` tag, which is what an admin publishing a project
 * already invalidates.
 *
 * Returns null on no matches rather than rendering a heading over a gap. The database starts
 * empty, and a service page that admits it has nothing to show is worse than one section
 * shorter.
 */
export async function ServiceWork({ service }: { service: Service }) {
  const projects = await getProjectsByService(service.slug, 3);

  if (projects.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Relevant work"
            title={`${service.name} projects we have delivered`}
            description="Each project page says what the problem was, what was built and what changed afterwards."
          />
          <ActionButton href="/portfolio" variant="outline">
            See the portfolio
          </ActionButton>
        </div>

        <StaggerGroup asChild className="mt-section-sm grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ul>
            {projects.map((project) => (
              <li key={project.id} className="h-full">
                <ProjectCard project={project} className="h-full" />
              </li>
            ))}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
