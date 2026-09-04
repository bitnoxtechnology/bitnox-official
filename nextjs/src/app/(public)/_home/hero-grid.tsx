/**
 * The hero's dashed grid.
 *
 * Four horizontal rules running the full width of the viewport and four vertical rules on
 * the page's own frame, all of them hairlines of short dashes in the brand line colour. It
 * is the only thing behind the hero: no gradient, no glow, no illustration.
 *
 * The point of a grid like this is that it is the page's construction lines made visible, so
 * every rule has to land on something real or it reads as wallpaper. None of the positions
 * here are eyeballed numbers.
 *
 * The horizontals use the same spacing tokens as the hero's own padding, so the second sits
 * exactly on the top of the headline block and the third exactly on the bottom of the
 * trusted-by row, at every viewport width and through both fluid steps of the scale. The
 * first and last mark where the section itself begins and ends. Nothing has to be re-measured
 * when the rhythm changes, because there is no second copy of the rhythm to update.
 *
 * The verticals sit on the content box of `container-page`, which is where every other
 * element on the page starts and stops, so the outer pair are the page's own margins drawn
 * in. Past 80rem they stop with the container and the ground beyond them is empty, which is
 * what keeps a very wide screen from reading as a grid that ran out of page.
 *
 * The inner pair is the one judgement call: 35.5% in from each edge, taken from the
 * reference, which puts them under the headline rather than beside it and stops the middle
 * of a 1200px band from being empty. They are hidden below `md`, where the frame is narrow
 * enough that two more lines would sit on top of the copy instead of behind it.
 *
 * Decorative, so the whole layer is `aria-hidden` and takes no pointer events. It is also
 * `-z-10` inside the hero's `isolate`, because a positioned element paints above the text of
 * its own container otherwise, and the grid would be drawn over the headline rather than
 * behind it.
 */
export function HeroGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Full bleed, edge to edge of the viewport. */}
      <div className="rule-x absolute inset-x-0 top-0 h-px" />
      <div className="rule-x top-section-sm lg:top-section absolute inset-x-0 h-px" />
      <div className="rule-x bottom-section absolute inset-x-0 h-px" />
      <div className="rule-x absolute inset-x-0 bottom-0 h-px" />

      {/* On the page's frame, so they line up with the content above them. */}
      <div className="container-page h-full">
        <div className="relative h-full">
          <div className="rule-y absolute inset-y-0 left-0 w-px" />
          <div className="rule-y absolute inset-y-0 right-0 w-px" />
          <div className="rule-y absolute inset-y-0 left-[35.5%] hidden w-px md:block" />
          <div className="rule-y absolute inset-y-0 right-[35.5%] hidden w-px md:block" />
        </div>
      </div>
    </div>
  );
}
