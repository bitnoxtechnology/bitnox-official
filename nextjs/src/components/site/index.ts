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
 */
export { SectionHeading } from "./section-heading";
export { GlassCard } from "./glass-card";
export { CTABand } from "./cta-band";
export { StatCounter } from "./stat-counter";
export { Gallery, type GalleryImage } from "./gallery";
