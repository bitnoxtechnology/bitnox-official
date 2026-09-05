import type { Metadata } from "next";
import { Suspense } from "react";

import { ProjectForm } from "@/app/admin/(dashboard)/portfolio/project-form";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { createProjectFormAction } from "@/lib/actions/portfolio-actions";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "New project" };

/** The create half of the project form. On success the action redirects to the edit screen. */
export default function NewProjectPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Add a project"
        description="Saved as a draft until you set it to published."
      />

      <Suspense fallback={<FormSkeleton />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  await requireUser();

  return <ProjectForm action={createProjectFormAction} submitLabel="Create the project" />;
}

function FormSkeleton() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-hidden>
      <div className="space-y-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
