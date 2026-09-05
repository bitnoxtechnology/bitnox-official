import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BlogFilters } from "@/app/(public)/blog/_sections/blog-filters";
import { BlogPagination } from "@/app/(public)/blog/_sections/blog-pagination";
import { PostGrid } from "@/app/(public)/blog/_sections/post-grid";
import { Reveal, SplitText } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { CTABand } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { BlogCardGridSkeleton } from "@/components/skeleton";
import { getBlogPage, POSTS_PER_PAGE } from "@/lib/queries/blog";

/**
 * The blog index.
 *
 * A static shell with a dynamic list inside it, which is what the caching strategy makes
 * possible and what the filters require. The hero, the headings and the closing call to
 * action are prerendered; the filter strip and the grid read `searchParams`, so they sit
 * behind a Suspense boundary and stream in. The database read behind them is still cached
 * under the `blog` tag, so the work happens once per filter rather than once per visit.
 *
 * Filtering is by URL rather than by client-side state. `/blog?category=Engineering` and
 * `/blog/tag/seo` are addresses a reader can send to somebody and a crawler can follow,
 * which is the entire reason the tag archives exist as pages of their own. Nothing on this
 * page ships JavaScript to filter anything.
 *
 * The metadata canonicalises every view onto `/blog`. The paginated and category-filtered
 * cuts are the same posts in a different order and a different slice, and having each one
 * compete for the same terms is how an index outranks the posts it links to. The tag
 * archives are the exception, and they have their own titles and descriptions because each
 * one is a genuinely different list.
 */

const TITLE = "Blog: notes on software, websites and running technology in Nigeria";

const DESCRIPTION =
  "What we built, what broke and what we would do differently. Practical writing on custom software, web development, technology decisions and training, from the Bitnox team in Abeokuta.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function BlogIndexPage({ searchParams }: PageProps<"/blog">) {
  return (
    <>
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
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
              <li className="text-foreground" aria-current="page">
                Blog
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <SplitText
              as="h1"
              by="word"
              delay={0.15}
              text={"Working notes from\nthe projects."}
              accentLines={[1]}
              className="text-foreground text-display font-semibold"
            />

            <Reveal delay={0.35}>
              <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
                What we built, what broke, and what we would do differently. Written for the person
                who has to make the decision, not for a search engine.
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <ActionButton href="/contact">Start a project</ActionButton>
                <ActionButton href="/services" variant="outline">
                  What we do
                </ActionButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Suspense fallback={<IndexFallback />}>
        <BlogResults searchParams={searchParams} />
      </Suspense>

      <CTABand
        title="Reading is not the same as deciding"
        description="If one of these is close to a problem you have, send it over with what you are actually trying to do. We will tell you which service it falls under, and when the answer is that you do not need us yet."
        action={{ label: "Talk to us", href: "/contact" }}
        secondaryAction={{ label: "See our work", href: "/portfolio" }}
      />
    </>
  );
}

/**
 * The filter strip, the grid and the pager.
 *
 * All three depend on `searchParams`, so they are awaited together in one dynamic component
 * rather than in three boundaries that would pop into place one after another.
 *
 * `page` is parsed rather than trusted. `Number("abc")` is NaN and NaN survives every
 * comparison, so a bad value is turned into 1 here instead of reaching the query, and the
 * query clamps it a second time against the real page count.
 */
async function BlogResults({ searchParams }: { searchParams: PageProps<"/blog">["searchParams"] }) {
  const params = await searchParams;

  const category = firstValue(params.category);
  const requestedPage = Number.parseInt(firstValue(params.page) ?? "", 10);

  const { posts, total, page, pageCount } = await getBlogPage({
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    category,
  });

  return (
    <section className="pb-section">
      <div className="container-page">
        <BlogFilters activeCategory={category} />

        {posts.length === 0 ? (
          <EmptyState category={category} />
        ) : (
          <>
            <p className="text-muted-foreground mt-10 text-sm">
              {describeRange(page, posts.length, total, category)}
            </p>

            <PostGrid posts={posts} priorityFirst className="mt-8" />

            <BlogPagination page={page} pageCount={pageCount} category={category} />
          </>
        )}
      </div>
    </section>
  );
}

/**
 * What the reader is looking at, in a sentence.
 *
 * A count is worth having on a paginated list because it is the only thing that says whether
 * there is more. It is written as a sentence rather than as "Showing 1-9 of 24", which reads
 * like a database and tells somebody nothing they could not see.
 */
function describeRange(page: number, shown: number, total: number, category?: string): string {
  const first = (page - 1) * POSTS_PER_PAGE + 1;
  const last = first + shown - 1;
  const scope = category ? `in ${category}` : "";

  if (total <= shown) {
    return total === 1 ? `One post ${scope}`.trim() : `${total} posts ${scope}`.trim();
  }

  return `Posts ${first} to ${last} of ${total} ${scope}`.trim();
}

function EmptyState({ category }: { category?: string }) {
  return (
    <div className="mt-section-sm mx-auto max-w-xl text-center">
      <h2 className="text-foreground text-2xl font-semibold">
        {category ? `Nothing in ${category} yet` : "Nothing published yet"}
      </h2>
      <p className="text-muted-foreground text-lead mt-stack">
        {category
          ? "That section is empty for now. The rest of the writing is on the main index."
          : "The first posts are being written. In the meantime, the service pages say what we do and how the work runs."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ActionButton href={category ? "/blog" : "/services"}>
          {category ? "See every post" : "Read about the services"}
        </ActionButton>
      </div>
    </div>
  );
}

function IndexFallback() {
  return (
    <section className="pb-section">
      <div className="container-page">
        <BlogCardGridSkeleton count={6} className="mt-10" />
      </div>
    </section>
  );
}

/**
 * One value out of a search parameter.
 *
 * `?category=a&category=b` parses to an array, and passing that array into a Mongo filter
 * would build a query nobody wrote. Taking the first is the same thing a browser form does.
 */
function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
