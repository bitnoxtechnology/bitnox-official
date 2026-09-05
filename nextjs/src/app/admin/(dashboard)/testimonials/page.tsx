import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { TestimonialList } from "@/app/admin/(dashboard)/testimonials/testimonial-list";
import {
  ClearFilters,
  ListFilter,
  ListPagination,
  ListSearch,
  ListToolbar,
} from "@/components/admin/list-controls";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/guards";
import { listTestimonials } from "@/lib/queries/admin/testimonials";
import { listQuerySchema } from "@/lib/validations/admin-schema";

export const metadata: Metadata = { title: "Testimonials" };

const STATUS_OPTIONS = [
  { value: "all", label: "Every status" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

/**
 * The testimonials, in the order the site shows them.
 *
 * Reordering is on the list itself rather than behind a field on each form, because the order
 * is a comparison between rows and cannot be judged one form at a time.
 */
export default function TestimonialsPage({ searchParams }: PageProps<"/admin/testimonials">) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Testimonials"
        description="Shown on the landing page and on the service page each one is tied to."
        actions={
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <Plus aria-hidden />
              Add a testimonial
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<ListSkeleton />}>
        <List searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function List({
  searchParams,
}: {
  searchParams: PageProps<"/admin/testimonials">["searchParams"];
}) {
  const [, params] = await Promise.all([requireUser(), searchParams]);

  const query = listQuerySchema.parse({
    q: params.q,
    status: params.status,
    page: params.page ?? 1,
  });

  const { rows, total, page, pageCount } = await listTestimonials(query);

  return (
    <>
      <div className="mt-6">
        <ListToolbar>
          <ListSearch placeholder="Search names, companies and quotes" />
          <ListFilter param="status" label="Status" options={STATUS_OPTIONS} />
          <ClearFilters params={["q", "status"]} />
        </ListToolbar>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={query.q || query.status ? "Nothing matches that" : "No testimonials yet"}
          description={
            query.q || query.status
              ? "Clear the search or the filter to see everything."
              : "A real quote from a real client, with their name on it. Nothing invented, and no star ratings nobody gave."
          }
          action={
            query.q || query.status ? null : (
              <Button asChild size="sm">
                <Link href="/admin/testimonials/new">Add the first one</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <TestimonialList testimonials={rows} />
          <ListPagination page={page} pageCount={pageCount} total={total} className="mt-6" />
        </>
      )}
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}
