"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

/**
 * Search, filter and paging, all of it in the URL.
 *
 * The state lives in the query string rather than in React, and that is the whole design. A
 * filtered list is a link somebody can send a colleague, the back button walks back through
 * the filters that were actually applied, and a page reloaded after an edit comes back to the
 * same view. Holding it in component state would give none of that and would need the filter
 * to be pushed to the server anyway.
 *
 * Everything below writes the same query and reads it back, so a screen wires up a search box
 * and a filter with two elements and no state of its own.
 */

/** Replaces a parameter, drops it when it is empty, and resets to page one. */
function buildQuery(current: URLSearchParams, changes: Record<string, string | undefined>) {
  const next = new URLSearchParams(current);

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === "" || value === "all") next.delete(key);
    else next.set(key, value);
  }

  // Any change to what is being looked at invalidates which page of it you were on. Page four
  // of an unfiltered list is rarely page four of the filtered one.
  if (!("page" in changes)) next.delete("page");

  const query = next.toString();
  return query ? `?${query}` : "";
}

/**
 * The search box.
 *
 * Debounced, and it replaces the history entry rather than pushing one. A typed search term
 * would otherwise leave one back-button step per keystroke, and getting out of a search would
 * mean pressing back eleven times.
 */
export function ListSearch({ placeholder = "Search" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const term = params.get("q") ?? "";
  const [value, setValue] = React.useState(term);

  // Re-synced when the URL changes underneath, which happens when the clear button is pressed
  // or a link elsewhere on the page drops the filter. During render rather than in an effect,
  // so the box is never briefly showing a search that has already been cleared.
  const [lastTerm, setLastTerm] = React.useState(term);

  if (term !== lastTerm) {
    setLastTerm(term);
    setValue(term);
  }

  React.useEffect(() => {
    const current = params.get("q") ?? "";
    if (value === current) return;

    const timer = window.setTimeout(() => {
      router.replace(`${pathname}${buildQuery(params, { q: value })}`, { scroll: false });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [value, params, pathname, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        aria-label={placeholder}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        className="pl-9"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear the search"
          onClick={() => setValue("")}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          <X aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * A single-select filter bound to one query parameter.
 *
 * `all` is a real option rather than an empty one, because a select whose first item is blank
 * reads as unset rather than as "everything", and the two are different questions.
 */
export function ListFilter({
  param,
  label,
  options,
  className,
}: {
  param: string;
  label: string;
  options: FilterOption[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const value = params.get(param) ?? "all";
  const selected = options.find((option) => option.value === value);

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        router.replace(`${pathname}${buildQuery(params, { [param]: next })}`, { scroll: false })
      }
    >
      <SelectTrigger size="sm" aria-label={label} className={cn("w-40", className)}>
        <SelectValue>{selected?.label ?? label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Numbered paging, as links.
 *
 * Links rather than buttons, so a page can be opened in a new tab and so the control works
 * before the page has hydrated. The window is five pages wide around the current one, with the
 * first and last always reachable, which is enough for a list of a few hundred rows and does
 * not turn into forty numbers on a wide screen.
 */
export function ListPagination({
  page,
  pageCount,
  total,
  className,
}: {
  page: number;
  pageCount: number;
  total: number;
  className?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  if (pageCount <= 1) {
    return (
      <p className={cn("text-muted-foreground text-sm", className)}>
        {total} {total === 1 ? "row" : "rows"}
      </p>
    );
  }

  const href = (target: number) => `${pathname}${buildQuery(params, { page: String(target) })}`;

  const window = [...Array(pageCount).keys()]
    .map((index) => index + 1)
    .filter((number) => number === 1 || number === pageCount || Math.abs(number - page) <= 1);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-muted-foreground text-sm">
        Page {page} of {pageCount}, {total} {total === 1 ? "row" : "rows"}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={page > 1 ? href(page - 1) : "#"}
              aria-disabled={page === 1}
              className={cn(page === 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>

          {window.map((number, index) => (
            <React.Fragment key={number}>
              {/* A gap in the sequence gets a real gap, so page 2 and page 39 are not shown
                  side by side as if they were adjacent. */}
              {index > 0 && number - (window[index - 1] ?? 0) > 1 ? (
                <PaginationItem aria-hidden className="text-muted-foreground px-1">
                  &hellip;
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationLink href={href(number)} isActive={number === page}>
                  {number}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          ))}

          <PaginationItem>
            <PaginationNext
              href={page < pageCount ? href(page + 1) : "#"}
              aria-disabled={page === pageCount}
              className={cn(page === pageCount && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

/** The row of controls above a table: search on the left, filters and actions on the right. */
export function ListToolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

/** Clears every filter at once, shown only when there is something to clear. */
export function ClearFilters({ params }: { params: string[] }) {
  const pathname = usePathname();
  const search = useSearchParams();

  if (!params.some((param) => search.has(param))) return null;

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href={pathname}>Clear filters</Link>
    </Button>
  );
}
