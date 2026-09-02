/**
 * Loading fallbacks.
 *
 * These are what a route's `loading.tsx` and the Suspense boundaries inside a page render.
 * Each one is sized to the component it replaces, so nothing shifts when the real content
 * arrives; layout shift caused by a badly sized skeleton counts against Cumulative Layout
 * Shift exactly as much as having no placeholder at all.
 *
 * The grids carry `role="status"` and the cards are `aria-hidden`, so assistive technology
 * hears "Loading posts" once instead of reading nine empty panels.
 */
export { BlogCardSkeleton, BlogCardGridSkeleton } from "./blog-card-skeleton";
export { PortfolioCardSkeleton, PortfolioGridSkeleton } from "./portfolio-card-skeleton";
export { TestimonialSkeleton, TestimonialGridSkeleton } from "./testimonial-skeleton";
