import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * A testimonial, waiting.
 *
 * Three lines of quote, then an avatar beside a name and a role. No image placeholder above
 * it: testimonials on this site are text with a small portrait, not cards with a hero
 * image, so the skeleton reserves the height the quote will actually take.
 */
export function TestimonialSkeleton() {
  return (
    <div className="glass rounded-xl p-6 sm:p-7" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-7 flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function TestimonialGridSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading testimonials"
      className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <TestimonialSkeleton key={index} />
      ))}
    </div>
  );
}
