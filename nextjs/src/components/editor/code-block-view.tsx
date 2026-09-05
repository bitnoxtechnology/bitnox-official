"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CODE_LANGUAGES, resolveLanguage } from "@/lib/blog/languages";

/**
 * A code block with its language on it.
 *
 * The language is not decoration. It is written into `class="language-x"` on save, and the
 * Shiki pass that colours the published post reads exactly that attribute. A block with the
 * wrong language set publishes as plain monospace, so the dropdown has to be visible on the
 * block rather than hidden behind a menu.
 *
 * The list comes from `src/lib/blog/languages.ts`, the same list Shiki loads grammars for.
 * That is the whole reason it is a fixed list and not a text field: a language the editor
 * offers and the highlighter does not load is a block that looks right here and wrong on the
 * page.
 *
 * `NodeViewContent` is where ProseMirror puts the actual text. It has to be a `<code>` inside
 * a `<pre>` for the extension's own serializer to match on the way out, so the header sits
 * above the `pre` rather than inside it.
 */
export function CodeBlockView({ node, updateAttributes, extension }: ReactNodeViewProps) {
  const [copied, setCopied] = React.useState(false);

  const language =
    resolveLanguage(node.attrs.language as string | undefined)?.id ??
    (extension.options.defaultLanguage as string | undefined) ??
    "typescript";

  async function copy() {
    try {
      await navigator.clipboard.writeText(node.textContent);
      setCopied(true);
      // Long enough to read, short enough that the button is ready again before anybody
      // reaches for it a second time.
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused outright, and there is nothing useful to say about
      // it here: the code is on screen and selectable.
      setCopied(false);
    }
  }

  return (
    <NodeViewWrapper className="glass my-4 overflow-hidden rounded-xl">
      <div
        className="border-border/60 flex items-center justify-between gap-2 border-b px-2 py-1.5"
        contentEditable={false}
      >
        <Select value={language} onValueChange={(value) => updateAttributes({ language: value })}>
          <SelectTrigger size="sm" className="h-7 w-44 border-0 bg-transparent text-xs">
            <SelectValue>
              {CODE_LANGUAGES.find((entry) => entry.id === language)?.label ?? language}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CODE_LANGUAGES.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => void copy()}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <pre className="overflow-x-auto">
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
