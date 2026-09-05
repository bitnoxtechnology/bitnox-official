import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PostBody } from "@/app/(public)/blog/_sections/post-body";
import { PostFooter } from "@/app/(public)/blog/_sections/post-footer";
import { PostHeader } from "@/app/(public)/blog/_sections/post-header";
import { RelatedPosts } from "@/app/(public)/blog/_sections/related-posts";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { CTABand } from "@/components/site";
import { BlogCardGridSkeleton } from "@/components/skeleton";
import { getPostBySlug, getPublishedPostSlugs } from "@/lib/queries/blog";
import { withPlaceholder } from "@/lib/static-params";

/**
 * One blog post.
 *
 * The page renders `contentHtml`, the snapshot written when the post was saved, so nothing
 * from the editor reaches a reader's browser. The only client component on the page is the
 * share row, which needs the clipboard API and nothing else does.
 *
 * Every published slug is prerendered. `dynamicParams = false` would be the natural companion
 * to a fixed set and Cache Components rejects that segment config, so a slug outside the set
 * reaches the page at request time and the `notFound()` below is what answers it. That is
 * also what makes a post published after the last build reachable: it renders once on demand,
 * is cached under its own tag, and is served statically from then on.
 *
 * A post that is a draft, scheduled or archived is a 404 here, exactly like a slug that never
 * existed. Writers see their work through `/blog/[slug]/preview`, which is behind a session
 * and a token.
 */
export async function generateStaticParams() {
  return withPlaceholder(await getPublishedPostSlugs(), "slug");
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // The page 404s a moment later. Returning the site defaults rather than inventing a title
  // for a post that does not exist is the only sensible answer here.
  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const path = `/blog/${post.slug}`;

  return {
    title,
    description,
    // `canonicalUrl` is set on the rare post that was first published elsewhere. Everything
    // else points at itself.
    alternates: { canonical: post.canonicalUrl ?? path },
    authors: post.author ? [{ name: post.author.name }] : undefined,
    keywords: post.tags.length > 0 ? post.tags : undefined,
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      tags: post.tags,
      // The generated card in `opengraph-image.tsx` is used when the post has no cover of
      // its own. Naming the cover here is what puts the real photograph in the preview
      // instead of a drawn title card.
      ...((post.ogImage ?? post.coverImage)
        ? {
            images: [
              {
                url: (post.ogImage ?? post.coverImage)!.url,
                alt: (post.ogImage ?? post.coverImage)!.alt,
              },
            ],
          }
        : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <ArticleSchema post={post} />
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <article>
        <PostHeader post={post} />

        <div className="pt-section-sm">
          <PostBody html={post.contentHtml} />
        </div>

        <PostFooter post={post} />
      </article>

      <Suspense fallback={<RelatedFallback />}>
        <RelatedPosts slug={post.slug} tags={post.tags} />
      </Suspense>

      <CTABand
        title="Have a project that looks like this one?"
        description="Tell us what the system or the site has to do and who uses it. We will come back with questions first and a schedule and a figure after, usually within one to two working days."
        action={{ label: "Start a project", href: "/contact" }}
        secondaryAction={{ label: "See our work", href: "/portfolio" }}
      />
    </>
  );
}

function RelatedFallback() {
  return (
    <section className="section-y">
      <div className="container-page">
        <BlogCardGridSkeleton count={3} />
      </div>
    </section>
  );
}
