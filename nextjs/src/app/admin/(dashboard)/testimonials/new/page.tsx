import type { Metadata } from "next";
import { Suspense } from "react";

import { TestimonialForm } from "@/app/admin/(dashboard)/testimonials/testimonial-form";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { createTestimonialFormAction } from "@/lib/actions/testimonial-actions";
import { requireUser } from "@/lib/auth/guards";
import { listProjectOptions } from "@/lib/queries/admin/portfolio";

export const metadata: Metadata = { title: "New testimonial" };

export default function NewTestimonialPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Add a testimonial"
        description="Saved as a draft until you set it to published."
      />

      <Suspense fallback={<FormSkeleton />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  const [, projects] = await Promise.all([requireUser(), listProjectOptions()]);

  return (
    <TestimonialForm
      projects={projects}
      action={createTestimonialFormAction}
      submitLabel="Add the testimonial"
    />
  );
}

function FormSkeleton() {
  return (
    <div className="mt-8 max-w-2xl space-y-5" aria-hidden>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
