import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The chrome every product graphic sits inside.
 *
 * The graphics in this folder are drawn interfaces rather than photographs or stock
 * illustration, and an interface needs a frame to read as one. A dashboard floating on the
 * page ground looks like a diagram; the same dashboard inside a titled window with an address
 * bar reads as a screen somebody uses, which is the whole point of putting it on a marketing
 * page.
 *
 * One rounded container per graphic, and nothing rounded inside it. That is deliberate: the
 * complaint these replaced was a page made of rounded cards, and a frame full of smaller
 * rounded boxes is the same page at a smaller scale. Inside the frame, structure comes from
 * hairlines, which is also how real interfaces are built.
 *
 * The frame is a container query root, and everything inside these graphics sizes against it
 * rather than against the viewport. That is what lets the same dashboard sit full width under a
 * hero and again in a five-column band beside a process rail: in the narrow one it drops its
 * nav rail and a table column by itself, without either page knowing it did.
 *
 * `url` renders an address bar, for anything that is a web page. `title` renders a label, for
 * anything that is an application. Passing neither gives a bare frame with the traffic
 * lights, which suits a document.
 *
 * The frame is `aria-hidden` without exception. A screen reader has no use for a drawn nav
 * rail, seven bars and four invented order references, and reading them out would be forty
 * seconds of noise in the middle of a page. `GraphicCaption` below is the accessible
 * equivalent: one line, outside the frame, saying what the picture shows. Every graphic in
 * this folder is used inside a `<figure>` with one.
 */
export function WindowFrame({
  url,
  title,
  meta,
  children,
  className,
}: {
  url?: string;
  title?: string;
  /** Right-aligned text in the title bar. A date, a status, a record count. */
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("glass @container overflow-hidden rounded-xl", className)}>
      <div className="border-border flex items-center gap-3 border-b px-4 py-3">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
        </div>

        {url ? (
          <p className="bg-background/50 border-border text-muted-foreground min-w-0 flex-1 truncate rounded-md border px-3 py-1 font-mono text-[11px]">
            {url}
          </p>
        ) : null}

        {title ? (
          <p className="text-muted-foreground min-w-0 flex-1 truncate text-xs font-medium">
            {title}
          </p>
        ) : null}

        {meta ? (
          <p className="text-muted-foreground hidden shrink-0 font-mono text-[11px] @md:block">
            {meta}
          </p>
        ) : null}
      </div>

      {children}
    </div>
  );
}

/**
 * The line under a graphic saying what it is.
 *
 * Every graphic on the site carries one. Two reasons, and the second is the one that matters:
 * a drawn interface with no caption is a claim that this is a screenshot of something Bitnox
 * runs, and these are illustrations. Saying so in one line under the frame is the difference
 * between showing the kind of thing we build and implying a customer we do not have.
 */
export function GraphicCaption({ children }: { children: ReactNode }) {
  return <figcaption className="text-muted-foreground mt-4 text-xs">{children}</figcaption>;
}
