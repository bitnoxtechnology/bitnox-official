import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EnquiryActionsMenu } from "@/app/admin/(dashboard)/enquiries/enquiry-actions-menu";
import {
  ClearFilters,
  ListFilter,
  ListPagination,
  ListSearch,
  ListToolbar,
} from "@/components/admin/list-controls";
import { EmptyState, EnquiryStatusBadge, PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth/guards";
import type { EnquiryType } from "@/lib/constants";
import { listEnquiries } from "@/lib/queries/admin/enquiries";
import { enquiryListQuerySchema } from "@/lib/validations/admin-schema";

export const metadata: Metadata = { title: "Enquiries" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

/** The type is where a message came from, said the way somebody answering it would say it. */
const TYPE_LABELS: Record<EnquiryType, string> = {
  contact: "Contact",
  event_space: "Event Space",
  cleaning: "Cleaning",
};

const TYPE_OPTIONS = [
  { value: "all", label: "Every type" },
  { value: "contact", label: "Contact" },
  { value: "event_space", label: "Event Space" },
  { value: "cleaning", label: "Cleaning" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Every status" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "responded", label: "Responded" },
];

/**
 * The inbox.
 *
 * One list across contact, Event Space and cleaning rather than three, because they arrive in
 * one collection with a type discriminator and because the person answering them works through
 * the day's messages rather than through a folder. The filter narrows it when that is wanted.
 *
 * Newest first, always. An enquiry is a message: the order is the arrival order, and there is
 * nothing else to sort it by that a reader of an inbox would recognise.
 */
export default function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Enquiries"
        description="Everything sent from the contact page, the Event Space form and the cleaning page."
      />

      <Suspense fallback={<TableSkeleton />}>
        <EnquiryTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function EnquiryTable({
  searchParams,
}: {
  searchParams: PageProps<"/admin/enquiries">["searchParams"];
}) {
  const [, params] = await Promise.all([requireUser(), searchParams]);

  const query = enquiryListQuerySchema.parse({
    q: params.q,
    type: params.type,
    status: params.status,
    page: params.page ?? 1,
  });

  const { rows, total, page, pageCount } = await listEnquiries(query);

  const filtered = Boolean(query.q || query.type || query.status);

  return (
    <>
      <div className="mt-6">
        <ListToolbar>
          <ListSearch placeholder="Search names, addresses and messages" />
          <ListFilter param="type" label="Type" options={TYPE_OPTIONS} />
          <ListFilter param="status" label="Status" options={STATUS_OPTIONS} />
          <ClearFilters params={["q", "type", "status"]} />
        </ListToolbar>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? "Nothing matches that" : "Nothing has come in yet"}
          description={
            filtered
              ? "Clear the search or the filters to see everything."
              : "Messages from the contact page, the Event Space enquiry form and the cleaning page all arrive here."
          }
        />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-32">Type</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-40">Received</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((enquiry) => (
                  <TableRow
                    key={enquiry.id}
                    data-state={enquiry.status === "new" ? "selected" : undefined}
                  >
                    <TableCell className="max-w-48">
                      <Link
                        href={`/admin/enquiries/${enquiry.id}`}
                        className="text-foreground hover:text-primary block truncate font-medium transition-colors"
                      >
                        {enquiry.name}
                      </Link>
                      <span className="text-muted-foreground block truncate text-xs">
                        {enquiry.email}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-sm">
                      <Link href={`/admin/enquiries/${enquiry.id}`} className="block">
                        <span className="text-foreground block truncate text-sm">
                          {enquiry.subject ?? enquiry.details?.eventType ?? "No subject"}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {enquiry.message}
                        </span>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{TYPE_LABELS[enquiry.type]}</Badge>
                    </TableCell>

                    <TableCell>
                      <EnquiryStatusBadge status={enquiry.status} />
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {dateFormat.format(new Date(enquiry.createdAt))}
                    </TableCell>

                    <TableCell>
                      <EnquiryActionsMenu
                        id={enquiry.id}
                        name={enquiry.name}
                        email={enquiry.email}
                        subject={enquiry.subject}
                        status={enquiry.status}
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
