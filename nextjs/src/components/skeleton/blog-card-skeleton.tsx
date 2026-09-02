import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * The shape of a blog card while the list is on its way.
 *
 * A skeleton is only worth having if it is the same size as the thing it stands in for.
 * These match the real card: a 16:9 cover, a tag row, a two-line title and one line of
 * meta, inside the same glass panel with the same padding. Get that wrong and the layout
 * jumps when the content lands, which is worse than an empty space.
 */
export function BlogCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-xl" aria-hidden>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/5" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/**
 * The blog index and the "latest posts" band, waiting.
 *
 * `count` matches the number of posts the real grid renders, so the page is the same height
 * before and after. The whole grid is one live region announcement rather than nine, which
 * is why the status role sits here and the cards are hidden.
 */
export function BlogCardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading posts"
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  );
}
