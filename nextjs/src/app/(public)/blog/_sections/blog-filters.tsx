import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublishedCategories, getPublishedTags } from "@/lib/queries/blog";
import { cn } from "@/lib/utils";

/**
 * The topics and sections a reader can narrow the index down to.
 *
 * A ruled strip rather than a row of pill badges, which is the substitution the page
 * composition rule names outright: `border-y` with `divide-x`, one row, no frames. Twenty
 * rounded pills is the shape a page takes when it has nothing to say about any of them.
 *
 * Both lists are links, not a client-side filter. Every combination is therefore a real URL
 * a crawler can reach and a reader can send to somebody, which is the whole reason the tag
 * archives exist as pages of their own. Nothing here ships JavaScript.
 *
 * The counts are shown because they are honest and useful: a tag with one post behind it is
 * worth knowing about before the click. They come from the same aggregation the archive
 * pages are generated from, so the number cannot disagree with the page it leads to.
 *
 * The search box is a plain `form` with `method="get"`, which is why it ships no JavaScript
 * either: the browser turns the field into `?q=` and navigates, exactly as the filter links
 * do. It is also what the `SearchAction` in `WebSiteSchema` points at, so a sitelinks search
 * box in Google's results lands on a page that really searches.
 *
 * Categories link back into the index with a query string, tags link to their own archive
 * page. That asymmetry is deliberate. A tag archive is a page worth indexing, with its own
 * title and description; a category is a coarser cut of the same list and does not need
 * forty URLs of its own competing with the tags.
 */
export async function BlogFilters({
  activeTag,
  activeCategory,
  query,
  /** The archive pages narrow by tag in the path, so the box would search the wrong list. */
  searchable = true,
}: {
  activeTag?: string;
  activeCategory?: string;
  query?: string;
  searchable?: boolean;
}) {
  const [tags, categories] = await Promise.all([getPublishedTags(), getPublishedCategories()]);

  if (tags.length === 0 && categories.length === 0) return null;

  return (
    <div className="border-border border-y">
      {searchable ? (
        <form
          method="get"
          action="/blog"
          role="search"
          className="border-border flex items-center gap-3 border-b py-3"
        >
          <label htmlFor="blog-search" className="sr-only">
            Search the blog
          </label>
          <Search className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <Input
            id="blog-search"
            type="search"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search posts"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          {/* Keeps the section narrowed when somebody searches from inside one. */}
          {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>
      ) : null}

      {categories.length > 0 ? (
        <div className="divide-border flex flex-wrap items-center divide-x">
          <span className="text-2xs text-primary py-4 pr-5 font-medium tracking-[0.14em] uppercase">
            Sections
          </span>
          <FilterLink href="/blog" active={!activeCategory && !activeTag}>
            Everything
          </FilterLink>
          {categories.map((category) => (
            <FilterLink
              key={category}
              href={`/blog?category=${encodeURIComponent(category)}`}
              active={category === activeCategory}
            >
              {category}
            </FilterLink>
          ))}
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div
          className={cn(
            "divide-border flex flex-wrap items-center divide-x",
            categories.length > 0 && "border-border border-t",
          )}
        >
          <span className="text-2xs text-primary py-4 pr-5 font-medium tracking-[0.14em] uppercase">
            Topics
          </span>
          {tags.map(({ tag, count }) => (
            <FilterLink key={tag} href={`/blog/tag/${tag}`} active={tag === activeTag}>
              {tag}
              <span className="text-muted-foreground ml-2 text-xs tabular-nums">{count}</span>
            </FilterLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "px-5 py-4 text-sm transition-colors first:pl-0",
        active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
