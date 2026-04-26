import React from "react";
import { Skeleton } from "../ui/skeleton";

const PortfolioCardSkeleton: React.FC = () => {
  return (
    <div className="portfolio-card" aria-hidden="true">
      <div className="portfolio-card-image-wrapper">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>
      <div className="portfolio-card-content">
        <div className="portfolio-card-tags">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-2/3 rounded-md mb-3" />
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-11/12 rounded" />
          <Skeleton className="h-4 w-10/12 rounded" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  );
};

export default PortfolioCardSkeleton;
