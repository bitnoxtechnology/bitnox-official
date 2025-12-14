import React from "react";
import { Skeleton } from "../ui/skeleton";

const BlogCardSkeleton: React.FC = () => {
  return (
    <article
      className="group block rounded-lg overflow-hidden shadow-lg transition-all duration-300 border border-gray-700"
      aria-hidden="true"
    >
      {/* Image area */}
      <div className="relative bg-primary h-56 w-full overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>

      <div className="py-5! px-3!">
        {/* Title */}
        <div className="mb-2!">
          <Skeleton className="h-8 w-3/5 rounded-md" />
        </div>

        {/* Excerpt (3 lines) */}
        <div className="space-y-2 mb-4!">
          <Skeleton className="h-3 rounded w-full" />
          <Skeleton className="h-3 rounded w-11/12" />
          <Skeleton className="h-3 rounded w-10/12" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4!">
          <Skeleton className="h-6 bg-primary rounded-full w-16" />
          <Skeleton className="h-6 bg-primary rounded-full w-12" />
          <Skeleton className="h-6 bg-primary rounded-full w-20" />
        </div>

        {/* Footer: author + meta */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-2 w-20 rounded" />
            </div>
          </div>

          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </article>
  );
};

export default BlogCardSkeleton;
