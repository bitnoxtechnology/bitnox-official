/**
 * The one place a JSON-LD block is written into the document.
 *
 * Every `<Type>Schema` component in this folder builds a plain object and hands it here, so
 * the escaping decision below is made once rather than in each of them.
 *
 * `dangerouslySetInnerHTML` is how a `<script>` with a body is written in React, and it is
 * safe here for a specific reason rather than by assumption: the content is
 * `JSON.stringify` of an object this application built, never a string from a request. The
 * one thing `JSON.stringify` does not escape is `<`, so a `</script>` appearing inside a
 * value, which is entirely possible in a blog excerpt or a testimonial, would close the tag
 * early and turn the rest of the block into markup. Replacing `<` with its unicode escape
 * costs nothing and closes that off.
 *
 * `type="application/ld+json"` rather than `next/script`, because structured data has to be
 * in the HTML a crawler parses, not injected after hydration.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
