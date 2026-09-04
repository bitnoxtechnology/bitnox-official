import { ImageGallerySchema } from "@/components/seo/ImageGallerySchema";
import { SectionHeading } from "@/components/site";
import { Gallery, type GalleryImage } from "@/components/site/gallery";

/**
 * The photographs.
 *
 * The section the whole page turns on. Nobody books a room they have not seen, and the
 * alternative to showing it properly is a visit, which most enquiries will not make before
 * deciding.
 *
 * The gallery is the `EventSpaceImage` collection in `sortOrder`, so an admin can add, reorder
 * and caption without a deploy, and falls back to the photographs shipped in
 * `public/event-space/` while the collection is empty. Both go through the same component and
 * carry the same required alt text.
 *
 * The cover is not repeated here. It is already the photograph across the top of the page at
 * full width, and the same picture twice inside one scroll is what makes a set of real
 * photographs look like stock. So the hero carries the cover and the priority hint, and this
 * grid carries the rest, which is also why the tiles here are all lazy.
 *
 * `ImageGallerySchema` still describes every photograph including the cover, because the
 * cover is on the page: markup has to describe what a reader can see, and it can see it in
 * the hero.
 */
export function GallerySection({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  // One photograph and it is the hero's, so there is no gallery to draw.
  const tiles = images.slice(1);

  if (tiles.length === 0) return null;

  return (
    <section id="gallery" className="section-y scroll-mt-24">
      <div className="container-page">
        <ImageGallerySchema images={images} name="Bitnox Event Space gallery" path="/event-space" />

        <SectionHeading
          eyebrow="The room"
          title="Inside the Event Space"
          description="Photographs of the room as it is used: laid out for a conference, set for a smaller group, and with a session running. Select any one to see it larger."
        />

        <Gallery
          images={tiles}
          columns={3}
          label="Bitnox Event Space photographs"
          priorityFirst={false}
          className="mt-section-sm"
        />
      </div>
    </section>
  );
}
