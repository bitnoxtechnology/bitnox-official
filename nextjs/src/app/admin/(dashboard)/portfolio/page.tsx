import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Star } from "lucide-react";

import { ProjectRowActions } from "@/app/admin/(dashboard)/portfolio/project-row-actions";
import {
  ClearFilters,
  ListFilter,
  ListPagination,
  ListSearch,
  ListToolbar,
} from "@/components/admin/list-controls";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVICES } from "@/content/services";
import { requireUser } from "@/lib/auth/guards";
import { listProjects } from "@/lib/queries/admin/portfolio";
import { listQuerySchema } from "@/lib/validations/admin-schema";

export const metadata: Metadata = { title: "Portfolio" };

const STATUS_OPTIONS = [
  { value: "all", label: "Every status" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const SERVICE_NAMES = new Map(SERVICES.map((service) => [service.slug, service.name]));

/**
 * The portfolio, in the order the site shows it.
 *
 * Sorted by `featured` then `order` rather than by when it was last edited, because the manual
 * ordering is what is being managed here and a list that does not show it is a list you cannot
 * reorder from.
 */
export default function PortfolioListPage({ searchParams }: PageProps<"/admin/portfolio">) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Portfolio"
        description="The work shown on the landing page, the portfolio index and the service pages."
        actions={
          <Button asChild>
            <Link href="/admin/portfolio/new">
              <Plus aria-hidden />
              Add a project
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<TableSkeleton />}>
        <ProjectsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProjectsTable({
  searchParams,
}: {
  searchParams: PageProps<"/admin/portfolio">["searchParams"];
}) {
  const [, params] = await Promise.all([requireUser(), searchParams]);

  const query = listQuerySchema.parse({
    q: params.q,
    status: params.status,
    page: params.page ?? 1,
  });

  const { rows, total, page, pageCount } = await listProjects(query);

  return (
    <>
      <div className="mt-6">
        <ListToolbar>
          <ListSearch placeholder="Search titles, clients and tags" />
          <ListFilter param="status" label="Status" options={STATUS_OPTIONS} />
          <ClearFilters params={["q", "status"]} />
        </ListToolbar>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={query.q || query.status ? "Nothing matches that" : "No projects yet"}
          description={
            query.q || query.status
              ? "Clear the search or the filter to see everything."
              : "The portfolio is the evidence behind every claim the service pages make. The site should not launch without it."
          }
          action={
            query.q || query.status ? null : (
              <Button asChild size="sm">
                <Link href="/admin/portfolio/new">Add the first one</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="w-56">Services</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="max-w-sm">
                      <span className="flex items-center gap-1.5">
                        {project.featured ? (
                          <Star className="text-primary size-3.5 shrink-0" aria-label="Featured" />
                        ) : null}
                        <Link
                          href={`/admin/portfolio/${project.id}`}
                          className="text-foreground hover:text-primary truncate font-medium transition-colors"
                        >
                          {project.title}
                        </Link>
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {project.client ? `${project.client} · ` : null}/portfolio/{project.slug}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-xs">
                      {project.services.length > 0
                        ? project.services.map((slug) => SERVICE_NAMES.get(slug) ?? slug).join(", ")
                        : "None yet"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                      {project.order}
                    </TableCell>

                    <TableCell>
                      <ProjectRowActions
                        id={project.id}
                        slug={project.slug}
                        title={project.title}
                        status={project.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ListPagination page={page} pageCount={pageCount} total={total} className="mt-6" />
        </>
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden>
      <Skeleton className="h-9 w-full max-w-md" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
