import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogForm } from "@/app/admin/(dashboard)/blog/blog-form";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { createBlogFormAction } from "@/lib/actions/blog-actions";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "New post" };

/**
 * A new post.
 *
 * The same form as the edit screen with the create action bound to it. On success the action
 * redirects to the edit screen for the record it made, rather than returning a message: after
 * "create" the writer is on paragraph one, and a form that no longer corresponds to a new
 * document is how a second copy of the post gets made by a second submission.
 */
export default function NewBlogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Write a post"
        description="Saved as a draft until you set it to published or scheduled."
      />

      <Suspense fallback={<FormSkeleton />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  await requireUser();

  return <BlogForm action={createBlogFormAction} submitLabel="Create the post" />;
}

function FormSkeleton() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-hidden>
      <div className="space-y-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
