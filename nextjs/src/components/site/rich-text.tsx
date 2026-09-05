import Link from "next/link";
import { Fragment } from "react";

import { isExternalHref, parseInline } from "@/lib/inline-text";

/**
 * A sentence from a content module, rendered with its bold, links and inline code.
 *
 * The copy on the legal, about and cleaning pages lives in `src/content/` as strings, so that
 * it can be read and corrected without opening a React file, which is what makes the copy
 * review pass at the end of a phase practical. Those strings still need a link inside a
 * sentence, and this is what puts one there.
 *
 * It reads the same syntax `src/lib/blog/blocks.ts` reads, through the same parser, so a
 * paragraph moved from a blog post into the about page renders identically.
 *
 * Internal links go through `next/link` and external ones through a plain anchor, which is
 * the same split the rest of the site makes: `edu.` and `cleaning.` are separate
 * applications on separate origins, and prefetching a URL this router cannot handle is a
 * wasted request.
 *
 * A server component, and it must stay one. It is rendered inside long-form copy on every
 * static page, and there is nothing interactive in a paragraph.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((segment, index) => {
        if (segment.href) {
          const external = isExternalHref(segment.href);

          if (external) {
            return (
              <a
                key={index}
                href={segment.href}
                rel="noopener"
                className="text-primary font-medium"
              >
                {segment.text}
              </a>
            );
          }

          return (
            <Link key={index} href={segment.href} className="text-primary font-medium">
              {segment.text}
            </Link>
          );
        }

        if (segment.code) {
          return (
            <code
              key={index}
              className="text-primary bg-muted border-border rounded-sm border px-1.5 py-0.5 font-mono text-[0.875em]"
            >
              {segment.text}
            </code>
          );
        }

        if (segment.bold) {
          return (
            <strong key={index} className="text-foreground font-semibold">
              {segment.text}
            </strong>
          );
        }

        return <Fragment key={index}>{segment.text}</Fragment>;
      })}
    </>
  );
}
