import { clientEnv } from "@/lib/env";

/**
 * Absolute URLs, for the places a relative path is not good enough.
 *
 * `metadataBase` makes Next resolve the relative paths a page declares in its `metadata`, and
 * nothing resolves the paths inside a JSON-LD block or an email. A crawler reading
 * `/event-space/image-4.jpg` in an `ImageObject` has no origin to attach it to, so the image
 * is simply not there as far as image search is concerned.
 */
export function absoluteUrl(path: string): string {
  return `${clientEnv.NEXT_PUBLIC_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The same, for an image that may already be absolute.
 *
 * Gallery images come from two places: Cloudinary, which returns a full `https://` URL, and
 * the photographs shipped in `public/`, which are site-relative. Both end up in the same
 * array, so the one that is already absolute is left alone.
 */
export function absoluteImageUrl(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://") ? url : absoluteUrl(url);
}
