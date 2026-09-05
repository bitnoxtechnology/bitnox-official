"use client";

import { clientEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

/**
 * What the result looks like, while it is being written.
 *
 * The two SEO fields are the only copy on the site that is written for a place the writer
 * cannot see. Everything else is checked by looking at the page. A title that reads well in a
 * text input is regularly one that is cut off mid-word in a search result, and the only way to
 * notice is to draw the result.
 *
 * The caps are the same ones the schema enforces, seventy and a hundred and eighty, so the
 * counter turning red and the form refusing to save are the same rule stated twice rather than
 * two rules that disagree.
 *
 * The fallbacks matter as much as the fields. Leaving the SEO title blank is a legitimate
 * choice and means "use the heading", so the preview shows the heading rather than an empty
 * line, which is what the crawler will do.
 */

const TITLE_LIMIT = 70;
const DESCRIPTION_LIMIT = 180;

export interface SerpPreviewProps {
  /** The path the record will publish to, such as `/blog/a-post`. */
  path: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
}

function Counter({ value, limit }: { value: number; limit: number }) {
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        value > limit ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {value}/{limit}
    </span>
  );
}

export function SerpPreview({
  path,
  title,
  description,
  seoTitle,
  seoDescription,
}: SerpPreviewProps) {
  const shownTitle = (seoTitle?.trim() || title.trim()) ?? "";
  const shownDescription = (seoDescription?.trim() || description.trim()) ?? "";
  const url = `${clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}${path}`;

  return (
    <figure className="border-border/60 rounded-xl border border-dashed p-4">
      <figcaption className="text-muted-foreground mb-3 flex items-center justify-between gap-3 text-xs">
        <span>How this looks in a search result</span>
        <span className="flex gap-3">
          <Counter value={shownTitle.length} limit={TITLE_LIMIT} />
          <Counter value={shownDescription.length} limit={DESCRIPTION_LIMIT} />
        </span>
      </figcaption>

      <p className="text-muted-foreground truncate text-xs">{url}</p>
      <p className="text-primary mt-1 truncate text-base leading-6">
        {shownTitle || "The title goes here"}
      </p>
      {/* Clamped rather than truncated with an ellipsis: two lines is what a result gets, and
          showing the third line cut off is a more honest preview than pretending it fits. */}
      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-5">
        {shownDescription ||
          "The description goes here. It is what somebody reads before deciding whether to click."}
      </p>
    </figure>
  );
}
