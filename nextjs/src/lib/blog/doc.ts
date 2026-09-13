/**
 * The empty Tiptap document, defined once and valid.
 *
 * The editor's schema declares the `doc` node as `block+`, so a document has to contain at
 * least one block. `{ "type": "doc" }` and `{ "type": "doc", "content": [] }` both look like
 * a reasonable placeholder for "nothing written yet" and both are rejected by ProseMirror's
 * own validator with `Invalid content for node doc`. ProseMirror will construct such a
 * document without complaining and then throw later, on the first edit that touches the
 * document's boundaries, which is why the failure shows up as an editor that crashes when
 * revisited rather than as an error on save.
 *
 * The placeholder was written out by hand in five places, three of which produced the invalid
 * form. This module is the one definition, and `normalizeDoc` is the gate every stored
 * document passes through on the way in and on the way out, so a record written before this
 * existed opens without crashing.
 *
 * Pure and isomorphic on purpose: the editor, the admin forms, the Zod schemas, the DTOs and
 * the Mongoose models all need it, and they do not all run in the same place.
 */

import type { TiptapDoc } from "@/models/shared";

interface DocLike {
  type?: unknown;
  content?: unknown;
}

/** A fresh document holding one empty paragraph, which is the smallest valid one. */
export function emptyDoc(): TiptapDoc {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

/** True for a value that is a Tiptap document, whatever it does or does not contain. */
export function isTiptapDoc(value: unknown): boolean {
  return typeof value === "object" && value !== null && (value as DocLike).type === "doc";
}

/**
 * Anything that was stored as a document, as a document the editor can open.
 *
 * A missing value, a `{}` left by the model's old default, and a `doc` with no blocks in it
 * all mean the same thing to a writer, so they all come back as the empty document rather
 * than as three different broken states.
 */
export function normalizeDoc(value: unknown): TiptapDoc {
  if (!isTiptapDoc(value)) return emptyDoc();

  const content = (value as DocLike).content;
  if (!Array.isArray(content) || content.length === 0) return emptyDoc();

  return value as TiptapDoc;
}
