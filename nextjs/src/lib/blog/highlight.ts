import "server-only";

import { cacheLife } from "next/cache";
import { createHighlighter, type Highlighter } from "shiki";

import { CODE_LANGUAGE_IDS, resolveLanguage } from "@/lib/blog/languages";

/**
 * Syntax highlighting for the code blocks inside a stored post.
 *
 * It happens on the server, once per render of a cached page, and the browser receives
 * coloured spans in the HTML. The alternative, shipping a highlighter to the client and
 * running it after hydration, would put a large parser into the bundle of every blog post to
 * recolour text that is already on screen, and it would flash uncoloured code first.
 *
 * The input is `contentHtml`, the snapshot Tiptap wrote at save time, so the markup being
 * matched here is markup this application generated. That is what makes a regular expression
 * the right tool rather than a parser: the shape is `<pre><code class="language-x">`, it is
 * produced by one renderer, and pulling in an HTML parser to find it would cost more than it
 * settles. A block whose language is not in the list is left exactly as it was, so an
 * unrecognised fence degrades to plain monospace instead of disappearing.
 *
 * The theme's own background is stripped from the `<pre>`. Shiki writes it as an inline
 * style, which would win over anything `globals.css` says, and a slab of GitHub's grey
 * inside a post on this ground reads as a foreign object. The token colours are kept, which
 * is the part worth having.
 */

const THEME = "github-dark-default";

/**
 * One highlighter for the process.
 *
 * Creating one loads and compiles every grammar in the list, which takes long enough that
 * doing it per post would be visible in the build. The promise is cached rather than the
 * resolved value, so two pages rendering at once share a single initialisation instead of
 * starting two.
 */
let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [THEME],
    langs: [...CODE_LANGUAGE_IDS],
  });

  return highlighterPromise;
}

/** `<pre>` with an optional `<code class="language-x">` inside it, non-greedy over the body. */
const CODE_BLOCK = /<pre[^>]*>\s*<code(?:\s+class="([^"]*)")?[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;

const LANGUAGE_CLASS = /language-([\w#+-]+)/i;

/**
 * Entities back to the characters they stand for.
 *
 * Tiptap escapes the code it stores, and Shiki tokenises source rather than markup, so
 * `&lt;div&gt;` would be highlighted as the six characters of an entity instead of as a tag.
 * Shiki escapes its own output afterwards, so nothing unescaped reaches the page.
 *
 * `&amp;` is decoded last. Decoding it first would turn a literal `&amp;lt;` in somebody's
 * code sample into `&lt;` and then into `<`, which is both wrong and the shape an injection
 * attempt takes.
 */
function decodeEntities(html: string): string {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/**
 * The rendered HTML of a post, with its code blocks coloured.
 *
 * Returns the input unchanged when there is nothing to highlight, which is most posts, and
 * in that case the highlighter is never created at all.
 *
 * A cache boundary, for two reasons that happen to agree.
 *
 * The one that forces it: Shiki reads `Date.now()` somewhere inside its tokeniser, and Cache
 * Components refuses to prerender a page that touches an unstable value outside a cached
 * function. Without this directive the build fails on the first post that has a code block in
 * it, which is exactly the case this module exists for.
 *
 * The one that makes it right anyway: highlighting is expensive and completely determined by
 * its input. The whole point of `contentHtml` being a stored snapshot is that a reader never
 * pays for rendering, and colouring it again on every request would put a chunk of that cost
 * straight back.
 *
 * The cache key is the HTML itself, which is why this declares no tag. Everything else on the
 * site is invalidated by tag because the data behind it changes while the key stays the same;
 * here the key *is* the content, so an edited post asks a different question and gets a
 * different answer. That also means the admin preview of a draft is never stale: the moment
 * a paragraph changes, so does the key.
 */
export async function highlightCodeBlocks(html: string): Promise<string> {
  "use cache";
  cacheLife("max");

  if (!html || !html.includes("<pre")) return html;

  const blocks = [...html.matchAll(CODE_BLOCK)];
  if (blocks.length === 0) return html;

  const highlighter = await getHighlighter();

  let result = "";
  let cursor = 0;

  for (const block of blocks) {
    const [match, classNames = "", body = ""] = block;
    const index = block.index ?? 0;

    result += html.slice(cursor, index);
    cursor = index + match.length;

    const language = resolveLanguage(LANGUAGE_CLASS.exec(classNames)?.[1]);

    if (!language) {
      result += match;
      continue;
    }

    const code = highlighter.codeToHtml(decodeEntities(body).replace(/\n$/, ""), {
      lang: language.id,
      theme: THEME,
      transformers: [
        {
          pre(node) {
            // The theme's background, removed. See the note at the top of the file.
            const style = String(node.properties.style ?? "");
            node.properties.style = style.replace(/background-color:[^;]*;?/gi, "").trim();
            node.properties.tabindex = "0";
          },
        },
      ],
    });

    // A figure rather than a bare `pre`, so the language has somewhere to be said out loud.
    // The caption is real text: a reader on a screen reader is told what the block is before
    // hearing it, and a `::before` carrying the name would not be read at all.
    result +=
      `<figure class="code-block" data-language="${language.label}">` +
      `<figcaption>${language.label}</figcaption>${code}</figure>`;
  }

  return result + html.slice(cursor);
}
