/**
 * Page-level pieces.
 *
 * A step above `components/ui/`, which holds the shadcn primitives. These are the composed
 * blocks that pages are actually made of: a section heading, a panel, a closing call to
 * action, a figure, a gallery. They own brand decisions (spacing rhythm, the glass
 * treatment, heading ranks) so that pages do not each make them again.
 *
 * `Gallery` and `StatCounter` are client components and are imported from their own files by
 * the routes that use them; they are re-exported here for symmetry.
 *
 * The chrome is deliberately absent. `Navbar`, `Footer`, `PropertySwitcher` and
 * `SkipToContent` are imported by their own paths, because `Navbar` is a client component and
 * re-exporting it here would pull the mobile sheet, the dropdown and their Radix
 * dependencies into the bundle of every page that wanted a `SectionHeading`.
 */
export { SectionHeading } from "./section-heading";
export { GlassCard } from "./glass-card";
export { CTABand } from "./cta-band";
export { StatCounter } from "./stat-counter";
export { Gallery, type GalleryImage } from "./gallery";

/** The three list cards. Server components, shared by the landing page and the index pages. */
export { BlogCard, formatDate } from "./blog-card";
export { ProjectCard } from "./project-card";
export { TestimonialCard } from "./testimonial-card";
export { StatusPage, type StatusAction } from "./status-page";
