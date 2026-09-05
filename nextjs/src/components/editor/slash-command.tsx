"use client";

import * as React from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import {
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Table as TableIcon,
  Film as VideoIcon,
  Type,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The slash menu.
 *
 * Typing `/` at the start of an empty line offers the block types, which is the shortcut a
 * writer reaches for once they have stopped looking at the toolbar. It is not a replacement
 * for the toolbar: the toolbar is discoverable and this is fast, and a writer needs both at
 * different points in the same week.
 *
 * Only block-level commands are here. Bold and italic belong to the selection, not to an
 * empty line, and offering them in a menu that opens on an empty paragraph would put them
 * somewhere they cannot be used.
 *
 * The menu is positioned against the caret's own rectangle, which the suggestion plugin hands
 * over on every keystroke. There is no floating-element library behind it: one menu on one
 * screen does not justify the dependency, and the only real requirement is that it flips above
 * the line when there is not room below.
 */

export interface SlashItem {
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  run: (editor: Editor, range: Range) => void;
}

/**
 * `deleteRange` first, in every one of these.
 *
 * The `/` and whatever was typed after it are still in the document when the command fires,
 * and a heading that opens with `/head` is the failure this line prevents.
 */
const ITEMS: SlashItem[] = [
  {
    title: "Text",
    description: "Plain paragraph",
    icon: Type,
    keywords: ["paragraph", "body", "text"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading",
    description: "Section heading",
    icon: Heading2,
    keywords: ["h2", "heading", "title"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Subheading",
    description: "Inside a section",
    icon: Heading3,
    keywords: ["h3", "subheading"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bulleted list",
    description: "Points in no order",
    icon: List,
    keywords: ["bullet", "unordered", "ul"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    description: "Steps in order",
    icon: ListOrdered,
    keywords: ["number", "ordered", "ol", "steps"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Task list",
    description: "Checkboxes",
    icon: ListTodo,
    keywords: ["todo", "task", "checkbox"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    description: "Pull a line out",
    icon: Quote,
    keywords: ["blockquote", "quote"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code block",
    description: "With a language on it",
    icon: Code2,
    keywords: ["code", "snippet", "pre"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Table",
    description: "Three columns to start",
    icon: TableIcon,
    keywords: ["table", "grid", "rows"],
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Divider",
    description: "A rule across the page",
    icon: Minus,
    keywords: ["hr", "divider", "rule", "separator"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Upload a picture",
    icon: ImageIcon,
    keywords: ["image", "picture", "photo", "upload"],
    // The upload dialog lives in the editor shell, so the item clears the slash text and
    // asks for it by event rather than reaching across for a ref.
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      editor.view.dom.dispatchEvent(new CustomEvent("bitnox:insert-image", { bubbles: true }));
    },
  },
  {
    title: "YouTube",
    description: "Embed a video",
    icon: VideoIcon,
    keywords: ["youtube", "video", "embed"],
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      editor.view.dom.dispatchEvent(new CustomEvent("bitnox:insert-youtube", { bubbles: true }));
    },
  },
];

function filterItems(query: string): SlashItem[] {
  const term = query.trim().toLowerCase();

  if (!term) return ITEMS;

  return ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      item.keywords.some((keyword) => keyword.includes(term)),
  );
}

/**
 * The list itself.
 *
 * Keyboard handling is imperative rather than declarative because the keys are pressed inside
 * ProseMirror, not inside this list: the editor keeps focus the whole time the menu is open,
 * which is what makes typing to filter work at all. The suggestion plugin forwards the events
 * here through the ref below.
 */
interface SlashListProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

interface SlashListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const SlashList = React.forwardRef<SlashListHandle, SlashListProps>(function SlashList(
  { items, command },
  ref,
) {
  const [selected, setSelected] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setSelected(0), [items]);

  React.useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false;

      if (event.key === "ArrowUp") {
        setSelected((current) => (current + items.length - 1) % items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelected((current) => (current + 1) % items.length);
        return true;
      }

      if (event.key === "Enter") {
        const item = items[selected];
        if (item) command(item);
        return true;
      }

      return false;
    },
  }));

  // Keeps the highlighted row in view when the arrow keys walk past the fold.
  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({
      block: "nearest",
    });
  }, [selected]);

  if (items.length === 0) {
    return (
      <div className="bg-popover text-muted-foreground ring-border w-72 rounded-lg p-3 text-sm shadow-lg ring-1">
        Nothing matches that.
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      // Not a listbox and not focusable: focus never leaves the editor, so announcing this as
      // a widget would promise a keyboard contract it does not have. The editor's own text is
      // what a screen reader is reading, and the visible list follows the arrow keys.
      aria-hidden
      className="bg-popover ring-border max-h-72 w-72 overflow-y-auto rounded-lg p-1 shadow-lg ring-1"
    >
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          tabIndex={-1}
          data-selected={index === selected}
          onMouseEnter={() => setSelected(index)}
          onMouseDown={(event) => {
            // The editor must not lose the selection the command is about to act on.
            event.preventDefault();
            command(item);
          }}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm",
            index === selected ? "bg-accent text-accent-foreground" : "text-foreground",
          )}
        >
          <item.icon className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="block truncate font-medium">{item.title}</span>
            <span className="text-muted-foreground block truncate text-xs">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

/**
 * Positioning, done by hand.
 *
 * The rectangle is the caret's, in viewport coordinates, so the menu is fixed rather than
 * absolute and needs no offset parent. It flips above the line when the space below would cut
 * it off, which is the only placement rule that actually matters when the caret is near the
 * bottom of a long post.
 */
function place(element: HTMLElement, rect: DOMRect): void {
  const height = element.offsetHeight || 288;
  const below = window.innerHeight - rect.bottom;

  element.style.position = "fixed";
  element.style.left = `${Math.min(rect.left, window.innerWidth - element.offsetWidth - 12)}px`;
  element.style.top = below < height + 16 ? `${rect.top - height - 8}px` : `${rect.bottom + 8}px`;
  element.style.zIndex = "60";
}

const suggestion: Omit<SuggestionOptions<SlashItem>, "editor"> = {
  char: "/",
  // Only on an empty line. A slash inside a sentence is a slash, and a menu that opens over
  // "and/or" is a menu that gets in the way of writing.
  allow: ({ state, range }) => {
    const node = state.doc.resolve(range.from).parent;
    return node.type.name === "paragraph" && node.textContent.trim().length <= 1;
  },
  items: ({ query }) => filterItems(query),
  command: ({ editor, range, props }) => props.run(editor, range),
  render: () => {
    let renderer: ReactRenderer<SlashListHandle, SlashListProps> | null = null;

    return {
      onStart: (props) => {
        renderer = new ReactRenderer(SlashList, {
          props: { items: props.items, command: (item: SlashItem) => props.command(item) },
          editor: props.editor,
        });

        const rect = props.clientRect?.();
        if (!rect || !(renderer.element instanceof HTMLElement)) return;

        document.body.append(renderer.element);
        place(renderer.element, rect);
      },
      onUpdate: (props) => {
        renderer?.updateProps({
          items: props.items,
          command: (item: SlashItem) => props.command(item),
        });

        const rect = props.clientRect?.();
        if (rect && renderer?.element instanceof HTMLElement) place(renderer.element, rect);
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          renderer?.element.remove();
          renderer?.destroy();
          renderer = null;
          return true;
        }

        return renderer?.ref?.onKeyDown(props.event) ?? false;
      },
      onExit: () => {
        renderer?.element.remove();
        renderer?.destroy();
        renderer = null;
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...suggestion })];
  },
});
