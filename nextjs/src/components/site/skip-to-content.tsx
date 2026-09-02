/**
 * The first thing in the tab order on every page.
 *
 * Without it, reaching the article on a blog post with a keyboard means tabbing through the
 * whole header first, on every page, every time. It is the cheapest accessibility fix there
 * is and the one most often skipped, because a sighted mouse user never sees it.
 *
 * It is visually hidden until it takes focus, which is the point: `sr-only` keeps it out of
 * the layout, and the `focus:` rules bring it back as a real, visible control the moment
 * somebody tabs onto it. It is not `display: none`, which would take it out of the tab order
 * and defeat the whole exercise.
 *
 * Every layout below this one renders the matching `<main id="main-content">`.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="bg-primary text-primary-foreground focus:ring-ring sr-only rounded-lg px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:ring-2 focus:ring-offset-2"
    >
      Skip to content
    </a>
  );
}
