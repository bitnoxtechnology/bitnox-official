"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Code,
  Italic,
  Link2,
  Link2Off,
  Pencil,
  Strikethrough,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * What appears over a selection.
 *
 * Two menus in one, because the selection is in one of two states and they want different
 * controls. Over a run of ordinary text it offers the marks that apply to a phrase. Over a
 * link it offers the address, an edit and an unlink, since that is the entire set of things
 * anybody does to a link they have already made.
 *
 * Deliberately short. The toolbar is where the full set lives; a bubble that repeats all
 * twenty-six controls covers the sentence being edited.
 */

interface BubbleButtonProps {
  icon: typeof Bold;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function BubbleButton({ icon: Icon, label, active, onClick }: BubbleButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(active && "bg-accent text-accent-foreground")}
    >
      <Icon aria-hidden />
    </Button>
  );
}

export interface SelectionBubbleProps {
  editor: Editor;
  onEditLink: () => void;
}

export function SelectionBubble({ editor, onEditLink }: SelectionBubbleProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance.isActive("bold"),
      italic: instance.isActive("italic"),
      underline: instance.isActive("underline"),
      strike: instance.isActive("strike"),
      code: instance.isActive("code"),
      link: instance.isActive("link"),
      href: (instance.getAttributes("link").href as string | undefined) ?? "",
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <BubbleMenu
      editor={editor}
      // Suppressed inside a code block. Bolding a line of TypeScript is not a thing anybody
      // means to do, and the bubble would sit over the code being read.
      shouldShow={({ editor: instance, from, to }) =>
        !instance.isActive("codeBlock") && (from !== to || instance.isActive("link"))
      }
      className="glass flex items-center gap-0.5 rounded-lg p-1 shadow-lg"
    >
      {state.link ? (
        <>
          <span className="text-muted-foreground max-w-56 truncate px-2 text-xs">{state.href}</span>
          <Separator orientation="vertical" className="mx-0.5 h-5" />
          <BubbleButton icon={Pencil} label="Edit link" onClick={onEditLink} />
          <BubbleButton
            icon={Link2Off}
            label="Remove link"
            onClick={() => chain().unsetLink().run()}
          />
        </>
      ) : (
        <>
          <BubbleButton
            icon={Bold}
            label="Bold"
            active={state.bold}
            onClick={() => chain().toggleBold().run()}
          />
          <BubbleButton
            icon={Italic}
            label="Italic"
            active={state.italic}
            onClick={() => chain().toggleItalic().run()}
          />
          <BubbleButton
            icon={Underline}
            label="Underline"
            active={state.underline}
            onClick={() => chain().toggleUnderline().run()}
          />
          <BubbleButton
            icon={Strikethrough}
            label="Strikethrough"
            active={state.strike}
            onClick={() => chain().toggleStrike().run()}
          />
          <BubbleButton
            icon={Code}
            label="Inline code"
            active={state.code}
            onClick={() => chain().toggleCode().run()}
          />
          <Separator orientation="vertical" className="mx-0.5 h-5" />
          <BubbleButton icon={Link2} label="Add link" onClick={onEditLink} />
        </>
      )}
    </BubbleMenu>
  );
}
