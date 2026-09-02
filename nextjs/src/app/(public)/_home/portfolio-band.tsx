import { StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { ProjectCard } from "@/components/site/project-card";
import { getPublishedProjects } from "@/lib/queries/portfolio";

/**
 * Recent work.
 *
 * Server-fetched and statically generated. The read is cached under the `portfolio` tag, so
 * publishing a project in the admin invalidates this section and the portfolio index in one
 * call, and nothing here is on a timer.
 *
 * The whole section returns null on an empty database rather than rendering a heading over
 * a gap or an apology about having no work to show. The database starts empty and stays that
 * way until an admin adds the first project, and a landing page with one fewer section is a
 * better first impression than a placeholder admitting there is nothing behind it.
 */
export async function PortfolioBand() {
  const projects = await getPublishedProjects(3);

  if (projects.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Recent work"
            title="Some of what we have built"
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
