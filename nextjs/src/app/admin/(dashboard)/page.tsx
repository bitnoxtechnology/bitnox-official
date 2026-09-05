import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CalendarRange,
  FileText,
  Folder,
  Inbox,
  Mail,
  MessageSquareQuote,
  Plus,
} from "lucide-react";

import {
  EmptyState,
  PageHeader,
  EnquiryStatusBadge,
  StatusBadge,
} from "@/components/admin/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isSuperAdmin, requireUser } from "@/lib/auth/guards";
import { getDashboardData, type ContentCounts } from "@/lib/queries/admin/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

/**
 * The dashboard.
 *
 * Counts, the last few posts, the last few enquiries, and the four things somebody signing in
 * is most likely to have come here to start. Deliberately not a chart: there is no traffic
 * data in this database, and a graph of how many posts exist over time is decoration.
 *
 * The counts and the two lists come from one query issuing its reads together, so the whole
 * screen costs a single round trip's worth of latency rather than eight.
 */
export default function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const [user, params, data] = await Promise.all([requireUser(), searchParams, getDashboardData()]);

  const superAdmin = isSuperAdmin(user);

  return (
    <>
      <PageHeader
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        description="Everything the site publishes is managed from here."
        actions={
          <>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus aria-hidden />
                Write a post
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/enquiries">
                <Inbox aria-hidden />
                Enquiries
                {data.enquiries.new > 0 ? ` (${data.enquiries.new})` : null}
              </Link>
            </Button>
          </>
        }
      />

      {params.denied === "super_admin" ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>
            That page is for super admins. Ask one of them if you need something from it.
          </AlertDescription>
        </Alert>
      ) : null}

      <Counts counts={data.counts} superAdmin={superAdmin} />

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="recent-posts">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="recent-posts" className="text-foreground text-sm font-semibold">
              Last edited
            </h2>
            <Link href="/admin/blog" className="text-primary text-sm hover:underline">
              All posts
            </Link>
          </div>

          {data.recentPosts.length === 0 ? (
            <EmptyState
              title="No posts yet"
              description="The blog is what the service pages link out to and what brings search traffic in. Three posts is enough to launch with."
              action={
                <Button asChild size="sm">
                  <Link href="/admin/blog/new">Write the first one</Link>
                </Button>
              }
            />
          ) : (
            <ul className="border-border/60 mt-3 divide-y divide-dashed border-y border-dashed">
              {data.recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="hover:bg-accent/40 flex items-center gap-3 px-1 py-3 transition-colors"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block truncate text-sm font-medium">
                        {post.title}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        Edited {dateFormat.format(new Date(post.updatedAt))}
                      </span>
                    </span>
                    <StatusBadge status={post.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-enquiries">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="recent-enquiries" className="text-foreground text-sm font-semibold">
              Latest enquiries
            </h2>
            <Link href="/admin/enquiries" className="text-primary text-sm hover:underline">
              The whole inbox
            </Link>
          </div>

          {data.recentEnquiries.length === 0 ? (
            <EmptyState
              title="Nothing has come in yet"
              description="Messages from the contact page, the Event Space enquiry form and the cleaning page all arrive here."
            />
          ) : (
            <ul className="border-border/60 mt-3 divide-y divide-dashed border-y border-dashed">
              {data.recentEnquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <Link
                    href={`/admin/enquiries/${enquiry.id}`}
                    className="hover:bg-accent/40 flex items-center gap-3 px-1 py-3 transition-colors"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block truncate text-sm font-medium">
                        {enquiry.name}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {enquiry.subject ?? enquiry.message}
                      </span>
                    </span>
                    <EnquiryStatusBadge status={enquiry.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

/**
 * The counts, as a ruled strip rather than a grid of cards.
 *
 * Eight numbers in eight rounded boxes is the shape a reader recognises as filler. A strip
 * with hairlines between the figures says the same thing in a quarter of the height and reads
 * as a summary, which is what it is.
 */
function Counts({ counts, superAdmin }: { counts: ContentCounts; superAdmin: boolean }) {
  const rows = [
    {
      href: "/admin/blog",
      icon: FileText,
      label: "Posts published",
      value: counts.blogPublished,
      note:
        counts.blogDrafts + counts.blogScheduled > 0
          ? `${counts.blogDrafts} draft, ${counts.blogScheduled} scheduled`
          : "Nothing waiting",
    },
    {
      href: "/admin/portfolio",
      icon: Folder,
      label: "Projects live",
      value: counts.projectsPublished,
      note: counts.projectsDrafts > 0 ? `${counts.projectsDrafts} in draft` : "Nothing in draft",
    },
    {
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
      label: "Testimonials",
      value: counts.testimonials,
      note: "Shown on the landing and service pages",
    },
    {
      href: "/admin/event-space",
      icon: CalendarRange,
      label: "Gallery photographs",
      value: counts.galleryImages,
      note: "On the Event Space page",
    },
    ...(superAdmin
      ? [
          {
            href: "/admin/newsletter",
            icon: Mail,
            label: "Subscribers",
            value: counts.subscribers,
            note: "Currently subscribed",
          },
        ]
      : []),
  ];

  return (
    <div className="border-border/60 mt-8 grid divide-y divide-dashed border-y border-dashed sm:grid-cols-2 sm:divide-x lg:grid-cols-5 lg:divide-y-0">
      {rows.map((row) => (
        <Link
          key={row.href}
          href={row.href}
          className="hover:bg-accent/30 group flex flex-col gap-1 px-4 py-5 transition-colors"
        >
          <span className="text-muted-foreground flex items-center gap-2 text-xs">
            <row.icon className="size-3.5" aria-hidden />
            {row.label}
          </span>
          <span className="text-foreground font-heading text-3xl font-semibold tracking-tight tabular-nums">
            {row.value}
          </span>
          <span className="text-muted-foreground text-xs">{row.note}</span>
        </Link>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex items-start justify-between gap-4">
        <div className="w-full max-w-sm">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="mt-8 h-28 w-full" />
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
