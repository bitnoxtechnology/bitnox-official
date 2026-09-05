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
 * Every view canonicalises to itself. Page two of the index is not page one and does not
 * hold the same posts, so pointing its canonical at `/blog` would tell a crawler to drop the
 * only URL from which posts ten to eighteen are reachable. What stops the paginated and
 * filtered cuts competing with the index is the title and the description saying which cut
 * they are, not a canonical disowning them.
 *
 * A search result is the exception. `?q=` produces an unbounded number of URLs from one page,
 * none of which is worth indexing, so those are marked `noindex, follow`: not indexed, still
 * crawled through to the posts they list.
 */

const TITLE = "Blog: notes on software, websites and running technology in Nigeria";

const DESCRIPTION =
  "What we built, what broke and what we would do differently. Practical writing on custom software, web development, technology decisions and training, from the Bitnox team in Abeokuta.";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const params = await searchParams;

  const category = firstValue(params.category);
  const query = firstValue(params.q)?.trim() || undefined;

  // The same cached read the page itself makes, for the same arguments, so this costs no
  // extra database work. It is here for one value: the clamped page number. `?page=99` over
  // three pages renders page three, and a canonical repeating the 99 would mint a new URL
  // for every number anybody types.
  const { page } = await getBlogPage({
    page: pageNumber(firstValue(params.page)),
    category,
    query,
  });

  const canonical = indexPath({ category, query, page });

  const title = query
    ? `Search: ${query}`
    : [TITLE, category ? `${category} posts` : undefined, page > 1 ? `page ${page}` : undefined]
        .filter(Boolean)
        .join(", ");

  const description = category
    ? `Posts on ${category} from the Bitnox team in Abeokuta. Practical writing on custom software, web development, technology decisions and training.`
    : DESCRIPTION;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { url: canonical, title, description },
    twitter: { card: "summary_large_image", title, description },
    // A search result page is one of infinitely many and belongs in nobody's index. The
    // links on it are still worth following, which is what `follow` says. Its canonical
    // points at itself rather than at `/blog`, because `noindex` beside a canonical naming
    // another URL is the one combination that can carry the `noindex` over to that URL.
    ...(query ? { robots: { index: false, follow: true } } : {}),
  };
}

/** The canonical form of an index URL: no `page=1` and no empty parameters. */
function indexPath({
  category,
  query,
  page,
}: {
  category?: string;
  query?: string;
  page: number;
}): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));

  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
}

/** A page parameter anybody can type, turned into a number. `?page=abc` is page one. */
function pageNumber(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1;
}

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
 * query clamps it a second time against the real page count. The search term reaches the
 * database as a literal, escaped where the pattern is built rather than here.
 */
async function BlogResults({ searchParams }: { searchParams: PageProps<"/blog">["searchParams"] }) {
  const params = await searchParams;

  const category = firstValue(params.category);
  const query = firstValue(params.q)?.trim() || undefined;

  const { posts, total, page, pageCount } = await getBlogPage({
    page: pageNumber(firstValue(params.page)),
    category,
    query,
  });

  return (
    <section className="pb-section">
      <div className="container-page">
        <BlogFilters activeCategory={category} query={query} />

        {posts.length === 0 ? (
          <EmptyState category={category} query={query} />
        ) : (
          <>
            <p className="text-muted-foreground mt-10 text-sm">
              {describeRange(page, posts.length, total, category, query)}
            </p>

            <PostGrid posts={posts} priorityFirst className="mt-8" />

            <BlogPagination page={page} pageCount={pageCount} category={category} query={query} />
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
function describeRange(
  page: number,
  shown: number,
  total: number,
  category?: string,
  query?: string,
): string {
  const first = (page - 1) * POSTS_PER_PAGE + 1;
  const last = first + shown - 1;
  const scope = [category ? `in ${category}` : "", query ? `matching ${quoted(query)}` : ""]
    .filter(Boolean)
    .join(" ");

  if (total <= shown) {
    return total === 1 ? `One post ${scope}`.trim() : `${total} posts ${scope}`.trim();
  }

  return `Posts ${first} to ${last} of ${total} ${scope}`.trim();
}

function EmptyState({ category, query }: { category?: string; query?: string }) {
  const heading = query
    ? `Nothing matches ${quoted(query)}`
    : category
      ? `Nothing in ${category} yet`
      : "Nothing published yet";

  const body = query
    ? "Try a shorter term, or one of the topics above. An archive is a narrower list than the index and often gets there faster."
    : category
      ? "That section is empty for now. The rest of the writing is on the main index."
      : "The first posts are being written. In the meantime, the service pages say what we do and how the work runs.";

  const narrowed = Boolean(query || category);

  return (
    <div className="mt-section-sm mx-auto max-w-xl text-center">
      <h2 className="text-foreground text-2xl font-semibold">{heading}</h2>
      <p className="text-muted-foreground text-lead mt-stack">{body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ActionButton href={narrowed ? "/blog" : "/services"}>
          {narrowed ? "See every post" : "Read about the services"}
        </ActionButton>
      </div>
    </div>
  );
}

/** What somebody typed, shown back to them in quotation marks rather than bare. */
function quoted(value: string): string {
  return `"${value}"`;
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
