import { highlightCodeBlocks } from "@/lib/blog/highlight";

/**
 * The post itself.
 *
 * `contentHtml` is the snapshot Tiptap rendered at save time, so the reader downloads no
 * editor, no schema and no extensions to read a paragraph of text. The only thing done to it
 * here is the Shiki pass over its code blocks, which also happens on the server: the browser
 * receives coloured spans in the HTML rather than a highlighter that recolours the page after
 * hydration.
 *
 * `dangerouslySetInnerHTML` is the correct tool and not a shortcut. The string is produced by
 * this application from stored editor JSON, written by an authenticated admin, and rendered
 * through a schema that only emits the nodes the editor supports. It is not user-submitted
 * markup, and there is no other way to render stored HTML.
 *
 * The prose styling lives in `globals.css` as the `prose-post` utility, because there is no
 * JSX here to hang classes on. That is the one exception the styling rule makes and the
 * reason it exists.
 *
 * The measure is set here rather than by the page, so a post, a project case study and a
 * preview all read at the same line length.
 */
export async function PostBody({ html }: { html: string }) {
  const rendered = await highlightCodeBlocks(html);

  return (
    <div className="container-page">
      <div
        className="prose-post mx-auto max-w-prose"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </div>
  );
}
