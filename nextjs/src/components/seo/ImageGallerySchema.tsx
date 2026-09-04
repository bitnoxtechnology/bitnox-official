import { JsonLd } from "@/components/seo/JsonLd";
import type { GalleryImage } from "@/components/site/gallery";
import { absoluteImageUrl, absoluteUrl } from "@/lib/urls";

/**
 * `ImageObject` annotations over a gallery.
 *
 * Photographs of a room somebody is deciding whether to book are worth as much in image
 * search as the page is in web search, and an `<img>` with alt text is the minimum a crawler
 * needs rather than everything it can use. These add the two things the markup carries and
 * the markup alone: a caption, and the page the image belongs to, so a result in image search
 * leads back here instead of to a bare file.
 *
 * `contentUrl` is absolute. A relative path in structured data has no origin to resolve
 * against and the image is treated as absent.
 *
 * The description falls back to the alt text, which every image on this site is required to
 * have. That is the same string a reader hears, which is the point: the caption in the markup
 * describes the photograph that is actually on the page.
 *
 * The first image is marked `representativeOfPage`. On the Event Space page that is the cover
 * shot, which is also the Open Graph image and the largest thing on screen, so all three
 * agree on which photograph stands for the room.
 */
export function ImageGallerySchema({
  images,
  name,
  path,
}: {
  images: readonly GalleryImage[];
  /** Names the gallery in the markup, such as "Bitnox Event Space gallery". */
  name: string;
  /** The page the photographs are on, from the site root. */
  path: string;
}) {
  if (images.length === 0) return null;

  const pageUrl = absoluteUrl(path);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "@id": `${pageUrl}#gallery`,
        name,
        url: pageUrl,
        associatedMedia: images.map((image, index) => ({
          "@type": "ImageObject",
          contentUrl: absoluteImageUrl(image.url),
          caption: image.caption ?? image.alt,
          description: image.alt,
          name: image.caption ?? image.alt,
          isPartOf: { "@id": `${pageUrl}#gallery` },
          ...(index === 0 ? { representativeOfPage: true } : {}),
        })),
      }}
    />
  );
}
