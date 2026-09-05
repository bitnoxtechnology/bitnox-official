import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProjectForm } from "@/app/admin/(dashboard)/portfolio/project-form";
import { PageHeader, StatusBadge } from "@/components/admin/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProjectFormAction } from "@/lib/actions/portfolio-actions";
import { requireUser } from "@/lib/auth/guards";
import { getProjectForEditor } from "@/lib/queries/admin/portfolio";

export const metadata: Metadata = { title: "Edit project" };

/**
 * One project, open for editing.
 *
 * The update action is bound to the id on the server rather than carried in a hidden field, so
 * there is nothing for a browser to change. The action re-validates it either way.
 */
export default function EditProjectPage({
  params,
  searchParams,
}: PageProps<"/admin/portfolio/[id]">) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Suspense fallback={<EditorSkeleton />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Editor({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/portfolio/[id]">["params"];
  searchParams: PageProps<"/admin/portfolio/[id]">["searchParams"];
}) {
  const [, { id }, query] = await Promise.all([requireUser(), params, searchParams]);

  const project = await getProjectForEditor(id);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={project.title}
        description={`/portfolio/${project.slug}`}
        actions={<StatusBadge status={project.status} />}
      />

      {query.created ? (
        <Alert className="border-primary/30 mt-6">
          <AlertDescription>
            The project exists as a draft. Nothing is public until the status is set to published.
          </AlertDescription>
        </Alert>
      ) : null}

      <ProjectForm
        project={project}
        action={updateProjectFormAction.bind(null, project.id)}
        submitLabel="Save the project"
      />
    </>
  );
}

function EditorSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="h-8 w-80" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
