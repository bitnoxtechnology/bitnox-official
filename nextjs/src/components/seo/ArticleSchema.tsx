import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/content/business";
import type { BlogDTO } from "@/lib/dto";
import { clientEnv } from "@/lib/env";
import { absoluteImageUrl, absoluteUrl } from "@/lib/urls";

/**
 * `Article` structured data for a blog post.
 *
 * `BlogPosting` rather than plain `Article`, because that is what these are and the more
 * specific type is the one Google's article documentation names. The fields that carry
 * weight are the headline, the two dates, the author and the publisher: between them they
 * are what lets a result show a byline and a date rather than a bare title.
 *
 * `dateModified` is emitted only when the post has actually been edited since it went out.
 * Every document carries an `updatedAt`, so passing it unconditionally would mark every post
 * as modified on the day it was published, which is noise rather than information.
 *
 * `mainEntityOfPage` points at the post's own URL, which is what tells a crawler that this
 * markup describes the page it is on rather than an article syndicated from somewhere else.
 *
 * The author is the person, the publisher is the company. They are different fields for a
 * reason and collapsing both onto the company loses the byline in the result.
 */
export function ArticleSchema({ post }: { post: BlogDTO }) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = post.ogImage ?? post.coverImage;

  const modified =
    post.publishedAt && post.updatedAt > post.publishedAt ? post.updatedAt : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: post.title,
        description: post.seoDescription ?? post.excerpt,
        url,
        inLanguage: "en-GB",
        ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        ...(modified ? { dateModified: modified } : {}),
        ...(image
          ? {
              image: {
                "@type": "ImageObject",
                url: absoluteImageUrl(image.url),
                description: image.alt,
              },
            }
          : {}),
        author: {
          "@type": "Person",
          name: post.author?.name ?? BUSINESS.legalName,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${clientEnv.NEXT_PUBLIC_SITE_URL}#organization`,
          name: BUSINESS.legalName,
          url: clientEnv.NEXT_PUBLIC_SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/logo.svg"),
          },
        },
        ...(post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
        ...(post.category ? { articleSection: post.category } : {}),
        timeRequired: `PT${post.readingMinutes}M`,
        isPartOf: {
          "@type": "Blog",
          "@id": `${clientEnv.NEXT_PUBLIC_SITE_URL}/blog#blog`,
          name: `${BUSINESS.shortName} blog`,
          url: absoluteUrl("/blog"),
        },
      }}
    />
  );
}
