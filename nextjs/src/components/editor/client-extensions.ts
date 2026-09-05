"use client";

import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { ReactNodeViewRenderer, type Extensions } from "@tiptap/react";

import { CodeBlockView } from "@/components/editor/code-block-view";
import { SlashCommand } from "@/components/editor/slash-command";
import { baseExtensions, codeBlockExtension } from "@/lib/blog/extensions";

/**
 * The editor's schema plus the three things only a browser needs.
 *
 * The schema itself is `baseExtensions` and `codeBlockExtension`, shared with the server so
 * that what the editor can write is exactly what `generateHTML` can render. Nothing added here
 * changes the document: a placeholder is a decoration, a character count is a number, and a
 * slash menu is a way of running commands that the toolbar also runs.
 *
 * The code block is the one that has to be extended rather than replaced. `extend` keeps the
 * name, the schema and the serializer and only attaches a React view, so a post written with
 * the dropdown and rendered without it produces identical HTML.
 */
export const clientExtensions: Extensions = [
  ...baseExtensions,
  codeBlockExtension.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockView);
    },
  }),
  Placeholder.configure({
    // Two placeholders. The empty document says what to do; every other empty line says how
    // to get a menu, which is the only way the slash command is discoverable at all.
    placeholder: ({ node, editor }) =>
      editor.isEmpty
        ? "Write the post. Press / for headings, lists, code and images."
        : node.type.name === "paragraph"
          ? "Press / for a block"
          : "",
    showOnlyWhenEditable: true,
  }),
  CharacterCount,
  SlashCommand,
];
