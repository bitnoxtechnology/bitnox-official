import { Fragment } from "react";

import { Reveal, ScrollScene, SplitText } from "@/components/motion";
import { InlineLink } from "@/components/site/inline-link";
import type { AboutChapter } from "@/content/about";
import { parseInline } from "@/lib/inline-text";
import { cn } from "@/lib/utils";

/**
 * The about page story, one screen per chapter.
 *
 * The three paragraphs used to sit in a single column under the hero at reading measure. That
 * is the honest way to set prose, and it also made the most important copy on the page the
 * easiest to scroll past. Each paragraph is now a chapter the height of the viewport, with a
 * label, a claim set at section size, and the paragraph itself at a size that has to be read
 * rather than skimmed.
 *
 * Everything that moves is driven by the scroll bar through `ScrollScene`, so the reader sets
 * the pace: the words brighten as the eye reaches them, the rule beside the paragraph draws as
 * a progress line, and the chapter numeral and the light behind it drift past at a different
 * rate from the page. The heading rises out of its mask on arrival, which is the one entrance
 * that is not scrubbed, because a heading should land, not creep.
 *
 * It stays a server component. The words are plain spans with a `data-scene` role, and the
 * scene finds them; no copy goes through a client bundle to be split.
 *
 * The composition rules still hold. There are no panels: each chapter sits on the page ground
 * under a hairline, the numeral is an outline rather than a fill, and the light is one soft
 * cyan spot that peaks and fades, not a glow behind everything.
 */
export function StoryChapters({ chapters }: { chapters: readonly AboutChapter[] }) {
  const count = String(chapters.length).padStart(2, "0");

  return (
    <div>
      {chapters.map((chapter, index) => (
        <StoryChapter key={chapter.label} chapter={chapter} index={index} count={count} />
      ))}
    </div>
  );
}

function StoryChapter({
  chapter,
  index,
  count,
}: {
  chapter: AboutChapter;
  index: number;
  count: string;
}) {
  const number = String(index + 1).padStart(2, "0");
  const headingId = `story-chapter-${number}`;
  // The numeral bleeds off the right edge on odd chapters and the left on even ones, so three
  // screens in a row do not share one silhouette.
  const mirrored = index % 2 === 1;

  return (
    <ScrollScene asChild>
      <section
        aria-labelledby={headingId}
        className="border-border relative flex min-h-svh items-center overflow-hidden border-t"
      >
        {/* The chapter numeral: an outline at the hairline colour, with a faint cyan fill
            behind it that the scene brings up as the chapter reaches the centre. */}
        <div
          aria-hidden
          data-scene="numeral"
          className={cn(
            "font-heading pointer-events-none absolute top-1/2 -translate-y-1/2 leading-none font-semibold tracking-[-0.06em] select-none",
            "text-[clamp(11rem,34vw,28rem)]",
            mirrored ? "left-[-0.08em]" : "right-[-0.08em]",
          )}
        >
          <span data-scene="numeral-fill" className="text-primary/10 absolute inset-0">
            {number}
          </span>
          <span className="text-transparent [-webkit-text-stroke:1px_var(--color-brand-line)]">
            {number}
          </span>
        </div>

        {/* One soft light, sized to the numeral, that drifts across it and peaks at centre. */}
        <div
          aria-hidden
          data-scene="light"
          className={cn(
            "pointer-events-none absolute top-1/2 size-[min(80vw,44rem)] -translate-y-1/2 rounded-full opacity-40",
            "bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_72%)]",
            mirrored ? "left-[-12%]" : "right-[-12%]",
          )}
        />

        <div className="container-page py-section relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className={cn("lg:col-span-4", mirrored && "lg:order-2")}>
              <Reveal>
                <p className="text-2xs text-primary flex items-center gap-3 font-medium tracking-[0.16em] uppercase">
                  <span className="tabular-nums">
                    {number}
                    <span className="text-muted-foreground"> / {count}</span>
                  </span>
                  <span aria-hidden className="bg-border h-px w-8" />
                  <span>{chapter.label}</span>
                </p>
              </Reveal>

              {/* `SplitText` owns the heading's aria-label, so the id the section is labelled
                  by sits on a visually hidden copy rather than on the split markup. */}
              <span id={headingId} className="sr-only">
                {chapter.title}
              </span>
              <SplitText
                as="h2"
                trigger="scroll"
                text={chapter.title}
                className="text-foreground text-section mt-5 font-semibold"
              />
            </div>

            <div className={cn("relative pl-7 lg:col-span-8 lg:pl-12", mirrored && "lg:order-1")}>
              {/* The reading rule: a dashed track, and a solid line that draws over it as the
                  words brighten. Fully drawn is the resting state, so it is complete without
                  JavaScript. */}
              <span aria-hidden className="rule-y absolute top-0 left-0 h-full w-px" />
              <span
                aria-hidden
                data-scene="rule"
                className="bg-primary absolute top-0 left-0 h-full w-px origin-top"
              />

              <p className="text-foreground text-[clamp(1.375rem,1.05rem+1.5vw,2.375rem)] leading-[1.45] font-medium tracking-[-0.012em] text-pretty">
                <ChapterWords text={chapter.body} />
              </p>
            </div>
          </div>
        </div>
      </section>
    </ScrollScene>
  );
}

/**
 * The paragraph, one span per word, through the same inline parser `RichText` uses.
 *
 * Whitespace stays as text between the spans rather than inside them, so the browser wraps
 * the line exactly as it would wrap the plain sentence. The spans are `display: inline`, not
 * `inline-block`, for one reason: an underline does not propagate into an inline-block box,
 * and the words inside a link have to keep theirs.
 */
function ChapterWords({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((segment, index) => {
        const words = <Words text={segment.text} />;

        if (segment.href) {
          return (
            <InlineLink key={index} href={segment.href}>
              {words}
            </InlineLink>
          );
        }

        if (segment.code) {
          return (
            <code
              key={index}
              data-scene="word"
              className="text-primary bg-muted border-border rounded-sm border px-1.5 py-0.5 font-mono text-[0.875em]"
            >
              {segment.text}
            </code>
          );
        }

        if (segment.bold) {
          return (
            <strong key={index} className="text-foreground font-semibold">
              {words}
            </strong>
          );
        }

        return <Fragment key={index}>{words}</Fragment>;
      })}
    </>
  );
}

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((piece, index) =>
        piece.trim() === "" ? (
          <Fragment key={index}>{piece}</Fragment>
        ) : (
          <span key={index} data-scene="word">
            {piece}
          </span>
        ),
      )}
    </>
  );
}
