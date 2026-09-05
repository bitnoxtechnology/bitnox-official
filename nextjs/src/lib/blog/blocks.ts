import { isExternalHref, parseInline, stripInline } from "@/lib/inline-text";
import type { TiptapDoc } from "@/models/shared";

/**
 * Written copy to the two things a post is stored as.
 *
 * A post's source of truth is Tiptap JSON, and `contentHtml` is a snapshot rendered from it
 * at save time. Everything written through the admin gets both from the editor. The launch
 * posts in `src/content/launch-posts.ts` are written before the editor exists, so they need
 * the same pair produced from something a person can actually write and review, which is
 * what these blocks are.
 *
 * The output is the shape Tiptap itself produces, not an approximation of it: a post seeded
 * through here opens in the editor, is edited and is saved back without anything being lost
 * or reshaped. That is the whole requirement. Nothing else in the application depends on
 * this module, and once the launch posts are in the database it is only read again if they
 * are reseeded.
 *
 * Inline formatting is a deliberately small subset. Bold, links and inline code are what a
 * plainly written article actually uses, and each maps onto one Tiptap mark. Anything more
 * expressive belongs in the editor, where it can be seen while it is being written.
 */

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "bulletList"; items: string[] }
  | { type: "orderedList"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "code"; language: string; code: string };

// --- Inline -----------------------------------------------------------------

/**
 * `**bold**`, `` `code` `` and `[label](/path)`.
 *
 * The parser lives in `src/lib/inline-text.ts` rather than here, because the same syntax is
 * read by `src/components/site/rich-text.tsx` when the legal, about and cleaning copy is
 * rendered straight into JSX. Two parsers would eventually disagree, and the way that
 * surfaces is a link working inside a blog post and rendering as literal square brackets on
 * the privacy page.
 */

/**
 * Text to HTML, escaped.
 *
 * The launch posts are written by hand rather than submitted, so nothing here is hostile.
 * Escaping anyway costs one function and means the snapshot cannot be broken by an ampersand
 * or a less-than sign appearing in an ordinary sentence.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineToHtml(text: string): string {
  return parseInline(text)
    .map((segment) => {
      const escaped = escapeHtml(segment.text);

      if (segment.href) {
        const rel = isExternalHref(segment.href) ? ' rel="noopener"' : "";
        return `<a href="${escapeHtml(segment.href)}"${rel}>${escaped}</a>`;
      }

      if (segment.code) return `<code>${escaped}</code>`;
      if (segment.bold) return `<strong>${escaped}</strong>`;

      return escaped;
    })
    .join("");
}

function inlineToTiptap(text: string): Record<string, unknown>[] {
  return parseInline(text).map((segment) => {
    const marks: Record<string, unknown>[] = [];

    if (segment.bold) marks.push({ type: "bold" });
    if (segment.code) marks.push({ type: "code" });
    if (segment.href) {
      marks.push({
        type: "link",
        attrs: {
          href: segment.href,
          target: isExternalHref(segment.href) ? "_blank" : null,
          rel: "noopener",
        },
      });
    }

    return marks.length > 0
      ? { type: "text", text: segment.text, marks }
      : { type: "text", text: segment.text };
  });
}

// --- Blocks -----------------------------------------------------------------

function paragraphNode(text: string): Record<string, unknown> {
  return { type: "paragraph", content: inlineToTiptap(text) };
}

/** A list item in Tiptap holds a paragraph, not raw text, which is what the editor writes. */
function listNode(type: "bulletList" | "orderedList", items: string[]): Record<string, unknown> {
  return {
    type,
    ...(type === "orderedList" ? { attrs: { start: 1 } } : {}),
    content: items.map((item) => ({ type: "listItem", content: [paragraphNode(item)] })),
  };
}

export function blocksToTiptap(blocks: readonly Block[]): TiptapDoc {
  return {
    type: "doc",
    content: blocks.map((block) => {
      switch (block.type) {
        case "heading":
          return {
            type: "heading",
            attrs: { level: block.level },
            content: inlineToTiptap(block.text),
          };
        case "bulletList":
        case "orderedList":
          return listNode(block.type, block.items);
        case "blockquote":
          return { type: "blockquote", content: [paragraphNode(block.text)] };
        case "code":
          return {
            type: "codeBlock",
            attrs: { language: block.language },
            content: [{ type: "text", text: block.code }],
          };
        case "paragraph":
          return paragraphNode(block.text);
      }
    }),
  };
}

export function blocksToHtml(blocks: readonly Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `<h${block.level}>${inlineToHtml(block.text)}</h${block.level}>`;
        case "bulletList":
        case "orderedList": {
          const tag = block.type === "bulletList" ? "ul" : "ol";
          const items = block.items.map((item) => `<li><p>${inlineToHtml(item)}</p></li>`).join("");
          return `<${tag}>${items}</${tag}>`;
        }
        case "blockquote":
          return `<blockquote><p>${inlineToHtml(block.text)}</p></blockquote>`;
        case "code":
          // The language class is what the Shiki pass in `highlight.ts` reads, and it is the
          // same attribute Tiptap's `CodeBlockLowlight` writes.
          return `<pre><code class="language-${block.language}">${escapeHtml(block.code)}</code></pre>`;
        case "paragraph":
          return `<p>${inlineToHtml(block.text)}</p>`;
      }
    })
    .join("");
}

/**
 * The plain text of a post, for the reading-time estimate and for an excerpt fallback.
 *
 * Code blocks are excluded. Nobody reads a configuration file at 200 words a minute, and
 * counting one would put a nine-minute estimate on a four-minute article.
 */
export function blocksToPlainText(blocks: readonly Block[]): string {
  return blocks
    .filter((block) => block.type !== "code")
    .map((block) => {
      if (block.type === "bulletList" || block.type === "orderedList") return block.items.join(" ");
      return block.text;
    })
    .map(stripInline)
    .join(" ");
}
