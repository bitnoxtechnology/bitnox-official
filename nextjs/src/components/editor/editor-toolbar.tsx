"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Film as VideoIcon,
  Underline as UnderlineIcon,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * The toolbar.
 *
 * Sticky, because a post is long and the controls are useless at the top of a screen the
 * writer has scrolled a thousand words past. It sticks to the top of the editor's own panel
 * rather than to the viewport, so it does not fight the admin header for the same strip.
 *
 * Every button reports whether its mark is active on the current selection, which is the
 * difference between a toolbar and a row of icons: a writer needs to see that the cursor is
 * inside a heading without reading the text to work it out.
 *
 * `useEditorState` rather than a re-render on every transaction. Tiptap fires one per
 * keystroke, and re-rendering twenty-six buttons on each is a measurable cost while typing;
 * this subscribes to the derived booleans and re-renders only when one of them changes.
 */

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon: Icon, label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      // The label is on the button rather than in a tooltip. An icon-only control with no
      // accessible name is unusable with a screen reader, and a tooltip is not a name.
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(active && "bg-accent text-accent-foreground")}
    >
      <Icon aria-hidden />
    </Button>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <Separator orientation="vertical" className="mx-1 h-5" />;
}

export interface EditorToolbarProps {
  editor: Editor;
  onLink: () => void;
  onImage: () => void;
  onYoutube: () => void;
}

export function EditorToolbar({ editor, onLink, onImage, onYoutube }: EditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance.isActive("bold"),
      italic: instance.isActive("italic"),
      underline: instance.isActive("underline"),
      strike: instance.isActive("strike"),
      highlight: instance.isActive("highlight"),
      code: instance.isActive("code"),
      subscript: instance.isActive("subscript"),
      superscript: instance.isActive("superscript"),
      link: instance.isActive("link"),
      h2: instance.isActive("heading", { level: 2 }),
      h3: instance.isActive("heading", { level: 3 }),
      h4: instance.isActive("heading", { level: 4 }),
      bulletList: instance.isActive("bulletList"),
      orderedList: instance.isActive("orderedList"),
      taskList: instance.isActive("taskList"),
      blockquote: instance.isActive("blockquote"),
      codeBlock: instance.isActive("codeBlock"),
      alignLeft: instance.isActive({ textAlign: "left" }),
      alignCenter: instance.isActive({ textAlign: "center" }),
      alignRight: instance.isActive({ textAlign: "right" }),
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      aria-orientation="horizontal"
      className="glass sticky top-0 z-20 flex flex-wrap items-center gap-0.5 rounded-t-xl px-2 py-1.5"
    >
      <Group>
        <ToolbarButton
          icon={Undo2}
          label="Undo"
          disabled={!state.canUndo}
          onClick={() => chain().undo().run()}
        />
        <ToolbarButton
          icon={Redo2}
          label="Redo"
          disabled={!state.canRedo}
          onClick={() => chain().redo().run()}
        />
      </Group>

      <Divider />

      <Group>
        <ToolbarButton
          icon={Heading2}
          label="Heading"
          active={state.h2}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={Heading3}
          label="Subheading"
          active={state.h3}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          icon={Heading4}
          label="Minor heading"
          active={state.h4}
          onClick={() => chain().toggleHeading({ level: 4 }).run()}
        />
      </Group>

      <Divider />

      <Group>
        <ToolbarButton
          icon={Bold}
          label="Bold"
          active={state.bold}
          onClick={() => chain().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          active={state.italic}
          onClick={() => chain().toggleItalic().run()}
        />
        <ToolbarButton
          icon={UnderlineIcon}
          label="Underline"
          active={state.underline}
          onClick={() => chain().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          active={state.strike}
          onClick={() => chain().toggleStrike().run()}
        />
        <ToolbarButton
          icon={Highlighter}
          label="Highlight"
          active={state.highlight}
          onClick={() => chain().toggleHighlight().run()}
        />
        <ToolbarButton
          icon={SubscriptIcon}
          label="Subscript"
          active={state.subscript}
          onClick={() => chain().toggleSubscript().run()}
        />
        <ToolbarButton
          icon={SuperscriptIcon}
          label="Superscript"
          active={state.superscript}
          onClick={() => chain().toggleSuperscript().run()}
        />
      </Group>

      <Divider />

      <Group>
        <ToolbarButton
          icon={List}
          label="Bulleted list"
          active={state.bulletList}
          onClick={() => chain().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Numbered list"
          active={state.orderedList}
          onClick={() => chain().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={ListTodo}
          label="Task list"
          active={state.taskList}
          onClick={() => chain().toggleTaskList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="Quote"
          active={state.blockquote}
          onClick={() => chain().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Code2}
          label="Code block"
          active={state.codeBlock}
          onClick={() => chain().toggleCodeBlock().run()}
        />
        <ToolbarButton
          icon={Minus}
          label="Divider"
          onClick={() => chain().setHorizontalRule().run()}
        />
      </Group>

      <Divider />

      <Group>
        <ToolbarButton
          icon={AlignLeft}
          label="Align left"
          active={state.alignLeft}
          onClick={() => chain().setTextAlign("left").run()}
        />
        <ToolbarButton
          icon={AlignCenter}
          label="Align centre"
          active={state.alignCenter}
          onClick={() => chain().setTextAlign("center").run()}
        />
        <ToolbarButton
          icon={AlignRight}
          label="Align right"
          active={state.alignRight}
          onClick={() => chain().setTextAlign("right").run()}
        />
      </Group>

      <Divider />

      <Group>
        <ToolbarButton icon={Link2} label="Link" active={state.link} onClick={onLink} />
        <ToolbarButton icon={ImageIcon} label="Image" onClick={onImage} />
        <ToolbarButton icon={VideoIcon} label="YouTube video" onClick={onYoutube} />
        <ToolbarButton
          icon={TableIcon}
          label="Table"
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
      </Group>
    </div>
  );
}
