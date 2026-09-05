import "server-only";

import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";

import { editorExtensions } from "@/lib/blog/extensions";
import type { TiptapDoc } from "@/models/shared";

/**
 * Tiptap JSON to the stored HTML snapshot.
 *
 * `contentJson` is the source of truth and `contentHtml` is a snapshot rendered here at save
 * time, so a reader never downloads the editor to see a paragraph of text. This is the only
 * place that conversion happens, and it happens on the server: `@tiptap/html/server` renders
 * through zeed-dom rather than through a browser DOM, so no window is required and nothing
 * from `@tiptap/react` is dragged into the action.
 *
 * The extension list is the same one the editor writes with. That is the entire correctness
 * argument: a node the editor can produce and this list cannot parse is dropped silently, so
 * there is one list and both sides import it.
 */

/** An empty document, for a post whose body has been cleared rather than never written. */
const EMPTY_DOC: TiptapDoc = { type: "doc", content: [] };

function isDoc(value: unknown): value is JSONContent {
  return typeof value === "object" && value !== null && (value as JSONContent).type === "doc";
}

export function renderContentHtml(doc: TiptapDoc | undefined): string {
  if (!isDoc(doc)) return "";

  try {
    return generateHTML(doc, editorExtensions);
  } catch {
    // A document that will not render is a bug worth failing loudly on in development, but
    // at save time the alternative to an empty snapshot is losing the post. `contentJson`
    // survives either way, so the body can be re-rendered once the cause is fixed.
    return "";
  }
}

/**
 * The plain text of a document, for the excerpt fallback and the search index.
 *
 * Walked over the JSON rather than stripped out of the HTML, because the JSON already has
 * the text separated from the structure and a regular expression over markup would have to
 * guess where one paragraph ends and the next begins.
 *
 * Code blocks are skipped. Nobody reads a configuration file at two hundred words a minute,
 * and counting one puts a nine-minute estimate on a four-minute article.
 */
export function docToPlainText(doc: TiptapDoc | undefined): string {
  if (!isDoc(doc)) return "";

  const parts: string[] = [];

  function walk(node: JSONContent): void {
    if (node.type === "codeBlock") return;
    if (typeof node.text === "string") parts.push(node.text);
    for (const child of node.content ?? []) walk(child);
  }

  walk(doc);

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function emptyDoc(): TiptapDoc {
  return { ...EMPTY_DOC };
}

/** True for a document with no text and no media in it, which is what an untouched editor holds. */
export function isEmptyDoc(doc: TiptapDoc | undefined): boolean {
  if (!isDoc(doc)) return true;
  if (docToPlainText(doc).length > 0) return false;

  let hasNode = false;

  function walk(node: JSONContent): void {
    if (hasNode) return;
    if (node.type && !["doc", "paragraph", "text"].includes(node.type)) {
      hasNode = true;
      return;
    }
    for (const child of node.content ?? []) walk(child);
  }

  walk(doc);

  return !hasNode;
}
