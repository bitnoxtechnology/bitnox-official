import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Numbered pages for the blog index.
 *
 * Real links rather than a button that fetches the next page, because these URLs are the
 * only way a crawler reaches post number fifty. An index that loads more posts on a click
 * leaves everything past the first nine unreachable except through the sitemap.
 *
 * The window is compressed rather than printed in full: first, last, the current page and
 * one either side, with an ellipsis over the gaps. Forty numbered links across the foot of a
 * page is a navigation aid nobody uses and forty more links for a crawler to weigh.
 *
 * Every link carries the active filter forward, which is what stops page two of a filtered
 * view silently reverting to everything.
 */
export function BlogPagination({
  page,
  pageCount,
  category,
  basePath = "/blog",
}: {
  page: number;
  pageCount: number;
  /** Carried through so a filtered list stays filtered on page two. */
  category?: string;
  /** `/blog` for the index, `/blog/tag/<tag>` for an archive. */
  basePath?: string;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number): string => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (target > 1) params.set("page", String(target));

    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <Pagination className="mt-section-sm">
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={href(page - 1)} />
          ) : (
            // Rendered as inert text rather than omitted, so the row does not shift
            // sideways between page one and page two.
            <span className="text-muted-foreground/50 px-2.5 text-sm select-none" aria-hidden>
              Previous
            </span>
          )}
        </PaginationItem>

        {pageNumbers(page, pageCount).map((entry, index) =>
          entry === "gap" ? (
            <PaginationItem key={`gap-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href={href(entry)}
                isActive={entry === page}
                aria-label={`Page ${entry}`}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          {page < pageCount ? (
            <PaginationNext href={href(page + 1)} />
          ) : (
            <span className="text-muted-foreground/50 px-2.5 text-sm select-none" aria-hidden>
              Next
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/**
 * First, last, the current page and its neighbours, with "gap" wherever numbers were left
 * out. A gap is only inserted where it actually stands for something: with seven pages or
 * fewer every number fits, and an ellipsis hiding a single page is worse than the page.
 */
function pageNumbers(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const window = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const pages = [...window]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  let previous = 0;

  for (const value of pages) {
    if (previous && value - previous > 1) {
      result.push(value - previous === 2 ? value - 1 : "gap");
    }
    result.push(value);
    previous = value;
  }

  return result;
}
