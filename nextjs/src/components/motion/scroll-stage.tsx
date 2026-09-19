"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { EASE, MOTION_OK, useGsapEffect } from "./gsap";

type ScrollStageProps = React.ComponentProps<"div"> & {
  /** Render the child element instead of a wrapping div, so a stage can be a `<section>`. */
  asChild?: boolean;
};

/**
 * A column of chapters read in order, beside a stage that stays put and shows one picture at
 * a time.
 *
 * The layout is the one product companies use to show a system screen by screen: the copy
 * scrolls, the screen does not, and each time the reader reaches the next chapter the stage
 * changes to the picture that belongs to it. `ScrollIndex` dims the rows the reader is not
 * on; this one swaps a whole artefact, and adds a strip of tabs under the stage that both
 * report progress through the chapters and jump to one when pressed.
 *
 * Like the other scrubbed primitives it finds its parts by `data-stage` role in its subtree,
 * so the markup stays a server component. Parts pair up by DOM order: the second chapter goes
 * with the second slide, the second tab and the second fill.
 *
 * - `chapter`: one block of copy. Carries `data-state`, `active` for the one whose top has
 *   passed the middle of the viewport most recently, `idle` for the rest. The chapter's own
 *   contents style themselves from it, which is how a capability list can slide in as its
 *   chapter arrives without the primitive knowing what a capability is.
 * - `slide`: one item in the stack the stage shows. Carries `data-state` as `before`,
 *   `active` or `after`, so the page can send a slide the reader has passed one way and a
 *   slide still to come the other. The primitive sets the state; the transition between
 *   states is CSS on the slide, which is what lets the site-wide reduced-motion guard in
 *   `globals.css` collapse it to a cut without this file checking anything.
 * - `tab`: a button for one chapter. Gets `aria-current="true"` while its chapter is current
 *   and, when pressed, scrolls that chapter to the middle of the viewport.
 * - `fill`: a line inside a tab that draws from its left edge as the reader moves through
 *   the chapter. Scrubbed, so it is the reader's position rather than an animation. Needs
 *   `origin-left`.
 *
 * Which chapter is current is decided without GSAP, from an `IntersectionObserver` on the
 * middle line of the viewport and a look at the chapters' rectangles when it fires. That is
 * deliberate: the stage has to follow the reader under reduced motion too, where the GSAP
 * chunk is never loaded, or a visitor with the setting on would read four chapters beside
 * one picture. Only the fills go through GSAP, because a scrubbed line is what ScrollTrigger
 * is for and it is decoration if it is missing.
 *
 * The server renders the first chapter and slide active and the fills fully drawn, so before
 * the script runs, with it off, or with reduced motion and no observer support, the section
 * is a complete first chapter and a complete strip rather than an empty stage.
 */
export function ScrollStage({ asChild = false, className, children, ...props }: ScrollStageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot.Root : "div";

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const role = (name: string) =>
      Array.from(root.querySelectorAll<HTMLElement>(`[data-stage="${name}"]`));

    const chapters = role("chapter");
    const slides = role("slide");
    const tabs = role("tab");

    if (chapters.length === 0) return;

    let current = -1;

    const activate = (index: number) => {
      if (index === current) return;
      current = index;

      root.dataset.stageActive = String(index);

      chapters.forEach((chapter, i) => {
        chapter.dataset.state = i === index ? "active" : "idle";
      });

      slides.forEach((slide, i) => {
        slide.dataset.state = i < index ? "before" : i > index ? "after" : "active";
      });

      tabs.forEach((tab, i) => {
        if (i === index) tab.setAttribute("aria-current", "true");
        else tab.removeAttribute("aria-current");
      });
    };

    // The current chapter is the last one whose top has crossed the middle of the viewport.
    // Reading the rectangles rather than trusting which element the observer reported means
    // a fast scroll that skips a chapter's crossing still lands on the right one at the
    // next callback, and a reader arriving mid-section from a restored scroll position lands
    // on the chapter in front of them rather than on the first.
    const resolve = () => {
      const line = window.innerHeight / 2;
      let index = 0;

      chapters.forEach((chapter, i) => {
        if (chapter.getBoundingClientRect().top <= line) index = i;
      });

      activate(index);
    };

    resolve();

    // Margins of minus half the viewport on both ends leave a root the height of a line
    // across the middle, so a callback fires each time a chapter's edge crosses it.
    const observer = new IntersectionObserver(resolve, {
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    });

    chapters.forEach((chapter) => observer.observe(chapter));

    // One delegated listener rather than a handler per tab, so the tabs stay server
    // markup. `scrollIntoView` follows the `scroll-behavior` on `<html>`, which the global
    // motion guard already switches to a jump under reduced motion.
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tab = target.closest<HTMLElement>('[data-stage="tab"]');
      if (!tab) return;

      const index = tabs.indexOf(tab);
      chapters[index]?.scrollIntoView({ block: "center" });
    };

    root.addEventListener("click", onClick);

    return () => {
      observer.disconnect();
      root.removeEventListener("click", onClick);
    };
  }, []);

  useGsapEffect(
    (gsap) => {
      const root = ref.current;
      if (!root) return;

      const chapters = gsap.utils.toArray<HTMLElement>('[data-stage="chapter"]', root);
      const fills = gsap.utils.toArray<HTMLElement>('[data-stage="fill"]', root);

      if (fills.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        fills.forEach((fill, index) => {
          const chapter = chapters[index];
          if (!chapter) return;

          gsap.fromTo(
            fill,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: EASE.scrub,
              scrollTrigger: {
                trigger: chapter,
                // The same line the observer watches, so a fill starts drawing at the
                // moment its tab becomes current and is full when the next one does.
                start: "top 50%",
                end: "bottom 50%",
                scrub: 0.3,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [] },
  );

  return (
    <Comp ref={ref} className={cn(className)} {...props}>
      {children}
    </Comp>
  );
}
