/**
 * The small inline syntax the content modules are written in.
 *
 * Three things: `**bold**`, `` `code` `` and `[label](/path)`. That is everything a plainly
 * written paragraph in `src/content/` actually uses, and each one maps onto exactly one
 * element in HTML and one mark in Tiptap.
 *
 * It exists because two unrelated consumers need to read the same sentences. The launch
 * posts in `src/content/launch-posts.ts` are turned into Tiptap JSON and an HTML snapshot by
 * `src/lib/blog/blocks.ts`; the legal, about and cleaning copy is rendered straight into JSX
 * by `src/components/site/rich-text.tsx`. Parsing it in one place is what stops a link
 * working in a blog post and rendering as literal square brackets on the privacy page.
 *
 * It is deliberately not Markdown. A full parser would invite headings, tables and images
 * inside a string, and those belong to the block level, where the surrounding component can
 * decide how they look.
 */

export interface InlineSegment {
  text: string;
  bold?: boolean;
  code?: boolean;
  /** Present when the segment is a link. Relative for this site, absolute for anywhere else. */
  href?: string;
}

/**
 * One pass, three alternatives.
 *
 * Running three passes in sequence would let the link pass rewrite something the code pass
 * had already decided was literal text, so all three are alternatives of a single expression
 * and the first one to match at a position wins.
 */
const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;

    if (index > cursor) segments.push({ text: text.slice(cursor, index) });
    cursor = index + match[0].length;

    const [, bold, code, label, href] = match;

    if (bold !== undefined) segments.push({ text: bold, bold: true });
    else if (code !== undefined) segments.push({ text: code, code: true });
    else if (label !== undefined && href !== undefined) segments.push({ text: label, href });
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor) });

  return segments;
}

/** True for a link leaving this origin, which decides `rel` and whether it opens elsewhere. */
export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

/** The same text with its markers removed, for a plain-text context such as a `title`. */
export function stripInline(text: string): string {
  return parseInline(text)
    .map((segment) => segment.text)
    .join("");
}
