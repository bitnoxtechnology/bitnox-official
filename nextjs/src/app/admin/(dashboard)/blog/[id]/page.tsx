import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BlogForm } from "@/app/admin/(dashboard)/blog/blog-form";
import { PageHeader, StatusBadge } from "@/components/admin/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { updateBlogFormAction } from "@/lib/actions/blog-actions";
import { requireUser } from "@/lib/auth/guards";
import { getBlogForEditor } from "@/lib/queries/admin/blog";

export const metadata: Metadata = { title: "Edit post" };

/**
 * One post, open for editing.
 *
 * This is the only read on the site that returns `contentJson`. Everything public reads the
 * rendered snapshot instead, which is what keeps the editor out of a reader's bundle.
 *
 * The update action is bound to the id here rather than passed through a hidden field. A
 * hidden id is a value the browser can change, and while the action re-validates it, binding
 * it on the server means there is nothing to change in the first place.
 */
export default function EditBlogPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
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
  params: PageProps<"/admin/blog/[id]">["params"];
  searchParams: PageProps<"/admin/blog/[id]">["searchParams"];
}) {
  const [, { id }, query] = await Promise.all([requireUser(), params, searchParams]);

  const post = await getBlogForEditor(id);
  if (!post) notFound();

  const save = updateBlogFormAction.bind(null, post.id);

  return (
    <>
      <PageHeader
        title={post.title}
        description={`/blog/${post.slug}`}
        actions={<StatusBadge status={post.status} />}
      />

      {query.created ? (
        <Alert className="border-primary/30 mt-6">
          <AlertDescription>
            The post exists as a draft. Nothing is public until the status is set to published.
          </AlertDescription>
        </Alert>
      ) : null}

      <BlogForm post={post} action={save} submitLabel="Save the post" />
    </>
  );
}

function EditorSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="h-8 w-80" />
      <Skeleton className="mt-2 h-4 w-52" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
