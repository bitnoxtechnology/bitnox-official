import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TestimonialForm } from "@/app/admin/(dashboard)/testimonials/testimonial-form";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { updateTestimonialFormAction } from "@/lib/actions/testimonial-actions";
import { requireUser } from "@/lib/auth/guards";
import { listProjectOptions } from "@/lib/queries/admin/portfolio";
import { getTestimonial } from "@/lib/queries/admin/testimonials";

export const metadata: Metadata = { title: "Edit testimonial" };

export default function EditTestimonialPage({ params }: PageProps<"/admin/testimonials/[id]">) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Suspense fallback={<FormSkeleton />}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/testimonials/[id]">["params"] }) {
  const [, { id }] = await Promise.all([requireUser(), params]);

  const [testimonial, projects] = await Promise.all([getTestimonial(id), listProjectOptions()]);
  if (!testimonial) notFound();

  return (
    <>
      <PageHeader
        title={testimonial.clientName}
        description={
          testimonial.company
            ? `${testimonial.position ? `${testimonial.position}, ` : ""}${testimonial.company}`
            : undefined
        }
      />

      <TestimonialForm
        testimonial={testimonial}
        projects={projects}
        action={updateTestimonialFormAction.bind(null, testimonial.id)}
        submitLabel="Save the testimonial"
      />
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="mt-8 max-w-2xl space-y-5" aria-hidden>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
