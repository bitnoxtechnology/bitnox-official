import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { Youtube } from "@tiptap/extension-youtube";
import type { Extensions } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { createLowlight } from "lowlight";

import bash from "highlight.js/lib/languages/bash";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

/**
 * The editor's schema, defined once.
 *
 * Two things read this list and they must agree exactly. The Tiptap instance in the admin
 * uses it to decide what can be written, and `generateHTML` in `render.ts` uses it on the
 * server to turn the stored JSON into the `contentHtml` snapshot a reader receives. A node
 * present in one and absent from the other is silently dropped on save, which is how an
 * editor loses a table between pressing the button and pressing save.
 *
 * Nothing here imports React or touches the DOM, so the same module loads inside a server
 * action. The React node views live in `src/components/editor/` and are added on top of this
 * list by the client editor, not baked into it.
 */

/**
 * Exactly the grammars in `src/lib/blog/languages.ts`, no more.
 *
 * lowlight ships a `common` bundle of about thirty-five languages. Loading all of them to
 * colour the four that ever appear in a Bitnox post puts the rest into the admin bundle for
 * nothing, and it would offer the writer languages that Shiki is not asked to load on the
 * public side, so a block highlighted in the editor would publish as plain text.
 *
 * JSX and TSX have no grammar of their own in highlight.js. They are registered as aliases of
 * their base language, which is what the writer means by them and what Shiki does with the
 * same class name on the way out.
 */
const lowlight = createLowlight();

lowlight.register({
  bash,
  csharp,
  css,
  dockerfile,
  go,
  java,
  javascript,
  json,
  php,
  python,
  rust,
  sql,
  typescript,
  xml,
  yaml,
});

lowlight.registerAlias({ javascript: ["jsx"], typescript: ["tsx"], xml: ["html"] });

/**
 * The schema.
 *
 * `codeBlock` is switched off in the StarterKit and replaced by `CodeBlockLowlight`, because
 * two extensions claiming the same node name is an error rather than an override.
 *
 * The link options are the ones that decide what a pasted URL does to a page ranking.
 * `openOnClick` is off so that clicking a link inside the editor selects it for editing
 * rather than navigating away mid-sentence. `rel` is `noopener` and nothing carries
 * `nofollow`: Tiptap stamps `noopener noreferrer nofollow` on every link by default, and a
 * blog whose own internal links are all nofollowed throws away the internal linking it
 * exists to do.
 */
/**
 * The code block, exported on its own.
 *
 * The admin extends this one with a React node view that draws the language dropdown and the
 * copy button. `extend` produces a new extension with the same name, schema and serializer, so
 * the document JSON is identical either way and only the client gets the interface. Exporting
 * it separately is what lets the client rebuild the list without re-stating the configuration
 * and letting the two drift.
 */
export const codeBlockExtension = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: "typescript",
});

/** Everything except the code block, in the order the schema is assembled. */
export const baseExtensions: Extensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: { levels: [2, 3, 4] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["http", "https", "mailto", "tel"],
      HTMLAttributes: { rel: "noopener", target: null },
    },
  }),
  Highlight.configure({ multicolor: false }),
  Image.configure({ inline: false, allowBase64: false }),
  Subscript,
  Superscript,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit.configure({ table: { resizable: true }, tableCell: {}, tableHeader: {}, tableRow: {} }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Youtube.configure({
    controls: true,
    nocookie: true,
    modestBranding: true,
    width: 720,
    height: 405,
  }),
];

export const editorExtensions: Extensions = [...baseExtensions, codeBlockExtension];
