import type { Metadata } from "next";
import { Suspense } from "react";
import { Download } from "lucide-react";

import { SubscriberActions } from "@/app/admin/(dashboard)/newsletter/subscriber-actions";
import {
  ClearFilters,
  ListFilter,
  ListPagination,
  ListSearch,
  ListToolbar,
} from "@/components/admin/list-controls";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
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
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSubscribers } from "@/lib/queries/admin/newsletter";
import { subscriberListQuerySchema } from "@/lib/validations/admin-schema";

export const metadata: Metadata = { title: "Newsletter" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Africa/Lagos",
});

const STATUS_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "subscribed", label: "Subscribed" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

/**
 * The mailing list.
 *
 * Super admins only, both here and in the actions behind it. An email list is the most portable
 * personal data this site holds, and the export makes a copy of it that leaves the application
 * entirely.
 *
 * The export is a link to a route handler rather than a button, because it has to be an HTTP
 * response with `Content-Disposition` on it: a server action returns a value to React, and only
 * a response can make a browser save a file.
 */
export default function NewsletterPage({ searchParams }: PageProps<"/admin/newsletter">) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Newsletter"
        description="Everyone who signed up through the footer or a blog post."
        actions={
          <Button variant="outline" asChild>
            <a href="/api/admin/newsletter/export?status=subscribed" download>
              <Download aria-hidden />
              Export as CSV
            </a>
          </Button>
        }
      />

      <Suspense fallback={<TableSkeleton />}>
        <SubscriberTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SubscriberTable({
  searchParams,
}: {
  searchParams: PageProps<"/admin/newsletter">["searchParams"];
}) {
  const [, params] = await Promise.all([requireSuperAdmin(), searchParams]);

  const query = subscriberListQuerySchema.parse({
    q: params.q,
    status: params.status,
    page: params.page ?? 1,
  });

  const { rows, total, page, pageCount } = await listSubscribers(query);
  const filtered = Boolean(query.q || query.status);

  return (
    <>
      <div className="mt-6">
        <ListToolbar>
          <ListSearch placeholder="Search email addresses" />
          <ListFilter param="status" label="Status" options={STATUS_OPTIONS} />
          <ClearFilters params={["q", "status"]} />
        </ListToolbar>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? "Nothing matches that" : "Nobody has signed up yet"}
          description={
            filtered
              ? "Clear the search or the filter to see everyone."
              : "The signup form is in the footer of every public page and at the foot of each blog post."
          }
        />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-40">Signed up from</TableHead>
                  <TableHead className="w-36">Joined</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="text-foreground max-w-xs truncate text-sm">
                      {subscriber.email}
                    </TableCell>

                    <TableCell>
                      <Badge variant={subscriber.status === "subscribed" ? "default" : "ghost"}>
                        {subscriber.status === "subscribed" ? "Subscribed" : "Unsubscribed"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground truncate text-sm">
                      {subscriber.source ?? "Not recorded"}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {dateFormat.format(new Date(subscriber.createdAt))}
                    </TableCell>

                    <TableCell>
                      <SubscriberActions
                        id={subscriber.id}
                        email={subscriber.email}
                        status={subscriber.status}
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
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
