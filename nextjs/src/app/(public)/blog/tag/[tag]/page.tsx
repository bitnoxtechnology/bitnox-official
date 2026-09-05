import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BlogFilters } from "@/app/(public)/blog/_sections/blog-filters";
import { BlogPagination } from "@/app/(public)/blog/_sections/blog-pagination";
import { PostGrid } from "@/app/(public)/blog/_sections/post-grid";
import { Reveal, SplitText } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { CTABand } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { BlogCardGridSkeleton } from "@/components/skeleton";
import { getBlogPage, getPublishedTags } from "@/lib/queries/blog";
import { withPlaceholder } from "@/lib/static-params";

/**
 * Every post carrying one tag.
 *
 * These are pages rather than a filtered view of the index because each one is a genuinely
 * different list with a subject of its own, and because the subject is usually the phrase
 * somebody searched for. `/blog/tag/business-systems` can rank for business systems in a way
 * that `/blog?tag=business-systems` cannot, and it can carry its own title and description
 * saying what the list is.
 *
 * Only tags that are actually on published posts are generated, so an archive page never
 * exists with nothing on it. A tag that stops being used stops being prerendered at the next
 * build and 404s, which is the correct answer for a subject the site no longer writes about.
 *
 * The heading is written from the tag rather than being the tag. A page whose `h1` is the
 * word "seo" tells a reader nothing; "Posts tagged seo" is a sentence and it is what the
 * page actually is.
 */

/** Tag slugs as they are stored: lowercase, hyphenated. `-` is spoken as a space. */
function readableTag(tag: string): string {
  return tag.replace(/-/g, " ");
}

export async function generateStaticParams() {
  const tags = await getPublishedTags();
  return withPlaceholder(
    tags.map((entry) => entry.tag),
    "tag",
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/tag/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  const readable = readableTag(decodeURIComponent(tag));

  const title = `Posts about ${readable}`;
  const description = `Everything the Bitnox team has written about ${readable}. Practical notes from building software, websites and business systems for clients in Nigeria and the UK.`;
  const path = `/blog/tag/${tag}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title, description },
    twitter: { title, description },
  };
}

export default async function BlogTagPage({ params, searchParams }: PageProps<"/blog/tag/[tag]">) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag).toLowerCase();
  const readable = readableTag(tag);

  return (
    <>
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: readable, path: `/blog/tag/${tag}` },
        ]}
      />

      <section className="pt-section-sm pb-section-sm lg:pt-section">
        <div className="container-page">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-foreground" aria-current="page">
                {readable}
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              Topic
            </p>

            <SplitText
              as="h1"
              by="word"
              delay={0.1}
              text={`Posts about ${readable}`}
              className="text-foreground text-4xl font-semibold sm:text-5xl"
            />

            <Reveal delay={0.3}>
              <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
                Everything we have written on this subject, most recent first.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <Suspense fallback={<TagFallback />}>
        <TagResults tag={tag} readable={readable} searchParams={searchParams} />
      </Suspense>

      <CTABand
        title="Working on something in this area?"
        description="Describe the problem rather than the solution. We will say which service it falls under, what it usually takes, and when the answer is that you do not need us yet."
        action={{ label: "Talk to us", href: "/contact" }}
        secondaryAction={{ label: "Every post", href: "/blog" }}
      />
    </>
  );
}

async function TagResults({
  tag,
  readable,
  searchParams,
}: {
  tag: string;
  readable: string;
  searchParams: PageProps<"/blog/tag/[tag]">["searchParams"];
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const requestedPage = Number.parseInt(raw ?? "", 10);

  const { posts, total, page, pageCount } = await getBlogPage({
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    tag,
  });

  // A tag with no published posts behind it is not a page. This catches a tag that was
  // prerendered and has since been removed from every post, and a hand-typed URL.
  if (total === 0) notFound();

  return (
    <section className="pb-section">
      <div className="container-page">
        <BlogFilters activeTag={tag} />

        <p className="text-muted-foreground mt-10 text-sm">
          {total === 1 ? `One post about ${readable}` : `${total} posts about ${readable}`}
        </p>

        <PostGrid posts={posts} priorityFirst className="mt-8" />

        <BlogPagination page={page} pageCount={pageCount} basePath={`/blog/tag/${tag}`} />

        <div className="mt-section-sm">
          <ActionButton href="/blog" variant="outline" size="sm">
            Every post
          </ActionButton>
        </div>
      </div>
    </section>
  );
}

function TagFallback() {
  return (
    <section className="pb-section">
      <div className="container-page">
        <BlogCardGridSkeleton count={6} className="mt-10" />
      </div>
    </section>
  );
}
