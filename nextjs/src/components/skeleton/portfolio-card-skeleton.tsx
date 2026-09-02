import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * A portfolio card, waiting.
 *
 * Taller cover than a blog card (4:3 rather than 16:9), because a project card leads with a
 * screenshot of the work and a wide crop cuts the top off most interfaces.
 */
export function PortfolioCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-xl" aria-hidden>
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-5 w-2/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading projects"
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <PortfolioCardSkeleton key={index} />
      ))}
    </div>
  );
}
