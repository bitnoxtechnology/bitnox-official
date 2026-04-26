import React from "react";
import { Skeleton } from "../ui/skeleton";

const TestimonialSkeleton: React.FC = () => {
  return (
    <div
      className="testimonial-card"
      aria-hidden="true"
      style={{ minWidth: "450px" }}
    >
      <Skeleton className="h-10 w-10 rounded mb-6" />
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-6 rounded" />
        ))}
      </div>
      <div className="space-y-2 mb-8">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-11/12 rounded" />
        <Skeleton className="h-4 w-10/12 rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
      <div
        className="flex items-center gap-5 pt-6"
        style={{ borderTop: "1px solid rgba(5,228,252,0.15)" }}
      >
        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      </div>
    </div>
  );
};

export default TestimonialSkeleton;
