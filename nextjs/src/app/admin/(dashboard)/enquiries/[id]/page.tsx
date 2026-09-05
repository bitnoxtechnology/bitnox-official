import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { EnquiryActionsMenu } from "@/app/admin/(dashboard)/enquiries/enquiry-actions-menu";
import { EnquiryStatusBadge, PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { markEnquiryReadAction } from "@/lib/actions/enquiry-actions";
import { requireUser } from "@/lib/auth/guards";
import type { EnquiryType } from "@/lib/constants";
import { getEnquiry } from "@/lib/queries/admin/enquiries";

export const metadata: Metadata = { title: "Enquiry" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeZone: "Africa/Lagos",
});

const TYPE_LABELS: Record<EnquiryType, string> = {
  contact: "Contact",
  event_space: "Event Space",
  cleaning: "Cleaning",
};

/**
 * One enquiry, in full.
 *
 * Opening it marks it read, which is what an inbox does. The action only moves a message out of
 * `new`, so reading one a colleague has already answered does not quietly demote it from
 * `responded` back to `read`.
 *
 * The Event Space details are shown as their own block when they are there. The date, the head
 * count and what the room is for are the three things that decide whether a booking is possible
 * at all, and burying them in the message would mean reading four paragraphs to find them.
 */
export default function EnquiryDetailPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/admin/enquiries">
          <ArrowLeft aria-hidden />
          Back to the inbox
        </Link>
      </Button>

      <Suspense fallback={<DetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

async function Detail({ params }: { params: PageProps<"/admin/enquiries/[id]">["params"] }) {
  const [, { id }] = await Promise.all([requireUser(), params]);

  const enquiry = await getEnquiry(id);
  if (!enquiry) notFound();

  // Read before it is rendered, so the badge on this page and the count in the sidebar agree
  // with each other on the next navigation.
  await markEnquiryReadAction(enquiry.id);

  const mailto = `mailto:${enquiry.email}?subject=${encodeURIComponent(
    enquiry.subject ? `Re: ${enquiry.subject}` : "Your enquiry to Bitnox",
  )}`;

  return (
    <>
      <PageHeader
        className="mt-4"
        title={enquiry.name}
        description={dateFormat.format(new Date(enquiry.createdAt))}
        actions={
          <>
            <Badge variant="outline">{TYPE_LABELS[enquiry.type]}</Badge>
            <EnquiryStatusBadge status={enquiry.status} />
            <EnquiryActionsMenu
              id={enquiry.id}
              name={enquiry.name}
              email={enquiry.email}
              subject={enquiry.subject}
              status={enquiry.status}
              onDeleted="/admin/enquiries"
            />
          </>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={mailto}>
            <Mail aria-hidden />
            {enquiry.email}
          </a>
        </Button>

        {enquiry.phone ? (
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${enquiry.phone.replace(/\s+/g, "")}`}>
              <Phone aria-hidden />
              {enquiry.phone}
            </a>
          </Button>
        ) : null}
      </div>

      {enquiry.details ? (
        <dl className="border-border/60 mt-8 grid gap-x-6 gap-y-3 border-y border-dashed py-5 text-sm sm:grid-cols-[9rem_1fr]">
          {enquiry.details.eventType ? (
            <>
              <dt className="text-muted-foreground">What it is for</dt>
              <dd className="text-foreground">{enquiry.details.eventType}</dd>
            </>
          ) : null}

          {enquiry.details.preferredDate ? (
            <>
              <dt className="text-muted-foreground">Preferred date</dt>
              <dd className="text-foreground">
                {dayFormat.format(new Date(enquiry.details.preferredDate))}
              </dd>
            </>
          ) : null}

          {enquiry.details.expectedAttendees ? (
            <>
              <dt className="text-muted-foreground">People expected</dt>
              <dd className="text-foreground">{enquiry.details.expectedAttendees}</dd>
            </>
          ) : null}
        </dl>
      ) : null}

      <section className="mt-8">
        {enquiry.subject ? (
          <h2 className="text-foreground text-base font-semibold">{enquiry.subject}</h2>
        ) : null}

        {/* The line breaks the sender typed are kept. A message reflowed into one block loses
            the paragraphing that made it readable. */}
        <p className="text-foreground mt-3 text-sm leading-7 whitespace-pre-wrap">
          {enquiry.message}
        </p>
      </section>

      {enquiry.source ? (
        <p className="text-muted-foreground mt-8 text-xs">Sent from {enquiry.source}.</p>
      ) : null}
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
