import Link from "next/link";

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
 * Categories link back into the index with a query string, tags link to their own archive
 * page. That asymmetry is deliberate. A tag archive is a page worth indexing, with its own
 * title and description; a category is a coarser cut of the same list and does not need
 * forty URLs of its own competing with the tags.
 */
export async function BlogFilters({
  activeTag,
  activeCategory,
}: {
  activeTag?: string;
  activeCategory?: string;
}) {
  const [tags, categories] = await Promise.all([getPublishedTags(), getPublishedCategories()]);

  if (tags.length === 0 && categories.length === 0) return null;

  return (
    <div className="border-border border-y">
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
