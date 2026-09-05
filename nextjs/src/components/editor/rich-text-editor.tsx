"use client";

import * as React from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";

import { clientExtensions } from "@/components/editor/client-extensions";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { ImageDialog, LinkDialog, YoutubeDialog } from "@/components/editor/editor-dialogs";
import { SelectionBubble } from "@/components/editor/selection-bubble";
import {
  clearDraft,
  readDraft,
  useDraftAutosave,
  useUnsavedGuard,
} from "@/components/editor/use-draft-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TiptapDoc } from "@/models/shared";

/**
 * The editor.
 *
 * It writes its document into a hidden input as JSON, which is how it reaches the server
 * action inside the same `FormData` as the title and the excerpt. The alternative, a separate
 * endpoint for the body, would mean a post that can be half saved.
 *
 * `immediatelyRender: false` is not optional here. Tiptap renders to a DOM that does not exist
 * on the server, and without this the admin page throws a hydration mismatch on first paint.
 *
 * Everything in this subtree is client code and none of it may reach a public page. The public
 * post page reads `contentHtml`, the snapshot the server rendered at save time, so a reader
 * downloads no part of this.
 */

export interface RichTextEditorProps {
  /** The form field the JSON document lands in. */
  name: string;
  initialContent: TiptapDoc | undefined;
  /** Namespaces the local autosave, so two records open at once do not overwrite each other. */
  draftScope: string;
  /** Raised on the first change, so the page can enable its save button and warn on leaving. */
  onDirtyChange?: (dirty: boolean) => void;
  /**
   * The serialized document, on every change.
   *
   * The hidden input below is what actually carries the body to the server. This exists so the
   * surrounding form can hold the same value in react-hook-form and have the shared Zod schema
   * validate the body in the browser, rather than discovering an empty post on the round trip.
   */
  onChange?: (json: string) => void;
  label?: string;
  className?: string;
}

/** A minute is the smallest unit worth saying. "Saved 3 seconds ago" reads as noise. */
function describeSaved(savedAt: number | null): string | null {
  if (!savedAt) return null;

  const minutes = Math.floor((Date.now() - savedAt) / 60_000);

  if (minutes < 1) return "Draft saved in this browser";
  if (minutes === 1) return "Draft saved a minute ago";
  return `Draft saved ${minutes} minutes ago`;
}

export function RichTextEditor({
  name,
  initialContent,
  draftScope,
  onDirtyChange,
  onChange,
  label = "Post body",
  className,
}: RichTextEditorProps) {
  const [json, setJson] = React.useState(() => JSON.stringify(initialContent ?? { type: "doc" }));
  const [dirty, setDirty] = React.useState(false);
  /**
   * A draft newer than what the server sent, offered rather than applied.
   *
   * Restoring it silently would be the wrong call: the copy in this browser might be an
   * abandoned experiment, and the version in the database might have been edited by somebody
   * else since. Both are shown and the writer picks.
   *
   * Read in the initializer rather than in an effect, so there is no pass that renders without
   * the notice and a second that renders with it. The server has no storage to read, and the
   * first client render draws the skeleton below while the editor is still being constructed,
   * so nothing here can differ between the two.
   */
  const [recovered, setRecovered] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null;

    const stored = readDraft(draftScope);
    const current = JSON.stringify(initialContent ?? { type: "doc" });

    return stored && stored.json !== current ? stored.json : null;
  });
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [imageOpen, setImageOpen] = React.useState(false);
  const [youtubeOpen, setYoutubeOpen] = React.useState(false);

  const editor = useEditor({
    extensions: clientExtensions,
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[28rem] px-4 py-6 focus:outline-none sm:px-6",
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: instance }) => {
      const next = JSON.stringify(instance.getJSON());
      setJson(next);
      onChange?.(next);
      setDirty(true);
    },
  });

  const counts = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      characters: instance?.storage.characterCount.characters() ?? 0,
      words: instance?.storage.characterCount.words() ?? 0,
    }),
  });

  const savedAt = useDraftAutosave(draftScope, json, dirty);
  useUnsavedGuard(dirty);

  React.useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

  /**
   * The slash menu asks for the image and video dialogs by event.
   *
   * A suggestion item runs inside ProseMirror with no route back into React, so it dispatches
   * on the editor's own element and this listens. The alternative, a module-level callback
   * registry, would be the same indirection with a global in it.
   */
  React.useEffect(() => {
    const element = editor?.view.dom;
    if (!element) return;

    const openImage = () => setImageOpen(true);
    const openYoutube = () => setYoutubeOpen(true);

    element.addEventListener("bitnox:insert-image", openImage);
    element.addEventListener("bitnox:insert-youtube", openYoutube);

    return () => {
      element.removeEventListener("bitnox:insert-image", openImage);
      element.removeEventListener("bitnox:insert-youtube", openYoutube);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div
        className={cn("glass h-[32rem] animate-pulse rounded-xl", className)}
        aria-label="Loading the editor"
      />
    );
  }

  return (
    <div className={cn("glass overflow-hidden rounded-xl", className)}>
      <input type="hidden" name={name} value={json} readOnly />

      <EditorToolbar
        editor={editor}
        onLink={() => setLinkOpen(true)}
        onImage={() => setImageOpen(true)}
        onYoutube={() => setYoutubeOpen(true)}
      />

      <SelectionBubble editor={editor} onEditLink={() => setLinkOpen(true)} />

      {recovered ? (
        <Alert className="border-primary/30 m-3 w-auto">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              There is a newer draft of this post saved in this browser. It has not been saved to
              the site.
            </span>
            <span className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  editor.commands.setContent(JSON.parse(recovered) as TiptapDoc);
                  setJson(recovered);
                  onChange?.(recovered);
                  setDirty(true);
                  setRecovered(null);
                }}
              >
                Restore it
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  clearDraft(draftScope);
                  setRecovered(null);
                }}
              >
                Discard it
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      ) : null}

      <EditorContent editor={editor} />

      <div className="border-border/60 text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2 text-xs">
        <span>
          {counts?.words ?? 0} {counts?.words === 1 ? "word" : "words"}, {counts?.characters ?? 0}{" "}
          characters
        </span>
        {/* Announced politely, so a writer using a screen reader hears the autosave land
            rather than having to go looking for it. */}
        <span role="status" aria-live="polite">
          {describeSaved(savedAt)}
        </span>
      </div>

      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        initialHref={(editor.getAttributes("link").href as string | undefined) ?? ""}
        onSubmit={(href) => editor.chain().focus().extendMarkRange("link").setLink({ href }).run()}
      />

      <ImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        onSubmit={({ src, alt }) => editor.chain().focus().setImage({ src, alt }).run()}
      />

      <YoutubeDialog
        open={youtubeOpen}
        onOpenChange={setYoutubeOpen}
        onSubmit={(src) => editor.chain().focus().setYoutubeVideo({ src }).run()}
      />
    </div>
  );
}

/** Clears the recovery copy once the record is safely saved. Called by the forms. */
export { clearDraft };
