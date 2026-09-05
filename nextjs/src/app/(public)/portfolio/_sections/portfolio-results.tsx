import Link from "next/link";

import { StaggerGroup } from "@/components/motion";
import { ProjectCard } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { SERVICE_BY_SLUG, isServiceSlug, serviceName } from "@/content/services";
import type { ServiceSlug } from "@/lib/constants";
import {
  getPortfolioServices,
  getProjectsByService,
  getPublishedProjects,
} from "@/lib/queries/portfolio";
import { cn } from "@/lib/utils";

/**
 * The portfolio list, with the service filter above it.
 *
 * The filter is a ruled strip of links rather than a row of pills or a client-side control,
 * for the same reason the blog's is: `/portfolio?service=web-development` is an address a
 * crawler can follow and somebody can send, and nothing here ships JavaScript to filter a
 * list the server has already filtered.
 *
 * Only services that published work actually exists for are offered, read from the projects
 * rather than from the content module, so the filter never leads to an empty page.
 *
 * The whole section returns an invitation rather than an apology on an empty database, which
 * is the state the site launches in. Portfolio entries are a Phase 0 input, and a page saying
 * there is no work to show would be a worse first impression than one that asks what the
 * reader is looking for.
 */
export async function PortfolioResults({ service }: { service?: string }) {
  const active = service && isServiceSlug(service) ? service : undefined;

  const [projects, available] = await Promise.all([
    active ? getProjectsByService(active, 60) : getPublishedProjects(),
    getPortfolioServices(),
  ]);

  return (
    <section className="pb-section">
      <div className="container-page">
        {available.length > 0 ? (
          <div className="border-border divide-border flex flex-wrap items-center divide-x border-y">
            <span className="text-2xs text-primary py-4 pr-5 font-medium tracking-[0.14em] uppercase">
              Filter
            </span>
            <FilterLink href="/portfolio" active={!active}>
              All work
            </FilterLink>
            {available.map((slug) => (
              <FilterLink key={slug} href={`/portfolio?service=${slug}`} active={slug === active}>
                {serviceName(slug)}
              </FilterLink>
            ))}
          </div>
        ) : null}

        {projects.length === 0 ? (
          <EmptyState active={active} />
        ) : (
          <>
            <p className="text-muted-foreground mt-10 text-sm">
              {describe(projects.length, active)}
            </p>

            <StaggerGroup
              asChild
              selector="li"
              className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <ul>
                {projects.map((project, index) => (
                  <li key={project.id} className="h-full">
                    <ProjectCard project={project} priority={index === 0} className="h-full" />
                  </li>
                ))}
              </ul>
            </StaggerGroup>
          </>
        )}
      </div>
    </section>
  );
}

function describe(count: number, active?: ServiceSlug): string {
  const scope = active ? ` in ${serviceName(active)}` : "";
  return count === 1 ? `One project${scope}` : `${count} projects${scope}`;
}

function EmptyState({ active }: { active?: ServiceSlug }) {
  const service = active ? SERVICE_BY_SLUG[active] : undefined;

  return (
    <div className="mt-section-sm mx-auto max-w-xl text-center">
      <h2 className="text-foreground text-2xl font-semibold">
        {service ? `No ${service.name} work published yet` : "Case studies are being written up"}
      </h2>
      <p className="text-muted-foreground text-lead mt-stack">
        {service
          ? "Nothing in this service is published here yet. Tell us what you are trying to build and we will send work that is close to it."
          : "Client work is being written up as case studies, with what the problem was, what was built and what changed afterwards. In the meantime, tell us what you need and we will send examples that match it."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ActionButton href="/contact">Ask for relevant examples</ActionButton>
        {service ? (
          <ActionButton href="/portfolio" variant="outline">
            All work
          </ActionButton>
        ) : (
          <ActionButton href="/services" variant="outline">
            Read about the services
          </ActionButton>
        )}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "px-5 py-4 text-sm transition-colors first:pl-0",
        active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
