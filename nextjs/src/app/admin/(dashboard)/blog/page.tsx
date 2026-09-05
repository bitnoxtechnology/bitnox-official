import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { BlogRowActions } from "@/app/admin/(dashboard)/blog/blog-row-actions";
import {
  ClearFilters,
  ListFilter,
  ListPagination,
  ListSearch,
  ListToolbar,
} from "@/components/admin/list-controls";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
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
import { requireUser } from "@/lib/auth/guards";
import { listBlogPosts } from "@/lib/queries/admin/blog";
import { listQuerySchema } from "@/lib/validations/admin-schema";

export const metadata: Metadata = { title: "Blog" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Africa/Lagos",
});

const STATUS_OPTIONS = [
  { value: "all", label: "Every status" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

/**
 * Every post, in every state.
 *
 * The search term, the status filter and the page all live in the URL, so a filtered view is a
 * link, the back button walks back through the filters that were applied, and reloading after
 * an edit returns to the same view.
 *
 * The list itself is read uncached. Everything the public sees goes through a cached, tagged
 * query; an admin is looking at the row they just changed, and a cached list would show them
 * the version from before they saved it.
 */
export default function BlogListPage({ searchParams }: PageProps<"/admin/blog">) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Blog"
        description="Drafts, scheduled posts and everything published."
        actions={
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus aria-hidden />
              Write a post
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<TableSkeleton />}>
        <PostsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function PostsTable({
  searchParams,
}: {
  searchParams: PageProps<"/admin/blog">["searchParams"];
}) {
  const [, params] = await Promise.all([requireUser(), searchParams]);

  // Parsed rather than trusted. Every one of these ends up in a Mongo query, and `?page=-5`
  // is a URL anybody can type.
  const query = listQuerySchema.parse({
    q: params.q,
    status: params.status,
    page: params.page ?? 1,
  });

  const { rows, total, page, pageCount } = await listBlogPosts(query);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <ListToolbar>
          <ListSearch placeholder="Search titles, tags and excerpts" />
          <ListFilter param="status" label="Status" options={STATUS_OPTIONS} />
          <ClearFilters params={["q", "status"]} />
        </ListToolbar>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={query.q || query.status ? "Nothing matches that" : "No posts yet"}
          description={
            query.q || query.status
              ? "Clear the search or the filter to see everything."
              : "The blog is what the service pages link out to and what brings search traffic in."
          }
          action={
            query.q || query.status ? null : (
              <Button asChild size="sm">
                <Link href="/admin/blog/new">Write the first one</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-40">Author</TableHead>
                  <TableHead className="w-36">Updated</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-md">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-foreground hover:text-primary block truncate font-medium transition-colors"
                      >
                        {post.title}
                      </Link>
                      <span className="text-muted-foreground block truncate text-xs">
                        /blog/{post.slug}
                        {post.tags.length > 0 ? ` · ${post.tags.join(", ")}` : null}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={post.status} />
                      {post.status === "scheduled" && post.scheduledFor ? (
                        <span className="text-muted-foreground mt-1 block text-xs">
                          {dateFormat.format(new Date(post.scheduledFor))}
                        </span>
                      ) : null}
                    </TableCell>

                    <TableCell className="text-muted-foreground truncate text-sm">
                      {post.author?.name ?? "Unknown"}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {dateFormat.format(new Date(post.updatedAt))}
                    </TableCell>

                    <TableCell>
                      <BlogRowActions
                        id={post.id}
                        slug={post.slug}
                        title={post.title}
                        status={post.status}
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
