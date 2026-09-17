"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { EASE, MOTION_OK, useGsapEffect } from "./gsap";

type ScrollSceneProps = React.ComponentProps<"div"> & {
  /** Render the child element instead of a wrapping div, so a scene can be a `<section>`. */
  asChild?: boolean;
};

/**
 * A screen of content whose parts move with the scroll bar as it passes through the viewport.
 *
 * The other primitives fire once, when an element crosses a line. This one is scrubbed: every
 * movement in it is tied to scroll position exactly, with no easing and no lag, so dragging
 * the page back and forth drags the scene back and forth with it. It is for the long-form
 * screens, the about page chapters, where the reader controls the pace and the page should
 * feel like it is being read rather than played.
 *
 * The scene does not know what its parts are. It looks for `data-scene` roles in its subtree
 * and gives each role one behaviour, so the markup stays a server component and the page
 * decides what is a word, what is a rule and what is a backdrop:
 *
 * - `word`: fades from a sixth of its opacity to full, one after another, over the first
 *   half of the pass. The classic reading reveal. Each word finishes as the eye reaches it,
 *   and because opacity is the only property touched the words can be plain inline spans
 *   inside links and bold runs without breaking the underline.
 * - `rule`: draws from its top edge over the same range as the words, so it is a reading
 *   progress line rather than decoration. Needs `origin-top` on the element.
 * - `numeral`: drifts upward across the whole pass, as `Parallax` would. Large type only.
 * - `numeral-fill`: fades in to the centre of the pass and out again, for a fill layer behind
 *   an outlined numeral, so the figure is brightest when the chapter is fully on screen.
 * - `light`: drifts diagonally and peaks at the centre, the same way. One per scene.
 *
 * Everything is a `fromTo` against the state the server rendered as the finished one, so with
 * JavaScript off, under reduced motion, or before the deferred GSAP chunk lands, the screen
 * is simply complete: words at full weight, rule drawn, numeral in place.
 */
export function ScrollScene({ asChild = false, className, children, ...props }: ScrollSceneProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot.Root : "div";

  useGsapEffect(
    (gsap) => {
      const scene = ref.current;
      if (!scene) return;

      const role = (name: string) =>
        gsap.utils.toArray<HTMLElement>(`[data-scene="${name}"]`, scene);

      const words = role("word");
      const rules = role("rule");
      const numerals = role("numeral");
      const fills = role("numeral-fill");
      const lights = role("light");

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // The reading range: from the scene entering to the moment its centre is a little
        // above the middle of the viewport. The words and the rule share it so the line's
        // progress is the paragraph's progress.
        const reading = { trigger: scene, start: "top 72%", end: "center 42%", scrub: 0.4 };
        // The full pass, edge to edge, for the parts that move like scenery.
        const through = { trigger: scene, start: "top bottom", end: "bottom top", scrub: true };

        if (words.length) {
          gsap.fromTo(
            words,
            { opacity: 0.16 },
            {
              opacity: 1,
              ease: EASE.scrub,
              duration: 1,
              // Each word takes a whole unit to brighten and the next starts a fraction
              // later, so at any moment about six words are in transition. Smaller and the
              // effect reads as a hard wipe; larger and the paragraph is grey until the end.
              stagger: 0.16,
              scrollTrigger: reading,
            },
          );
        }

        if (rules.length) {
          gsap.fromTo(
            rules,
            { scaleY: 0 },
            { scaleY: 1, ease: EASE.scrub, scrollTrigger: reading },
          );
        }

        if (numerals.length) {
          gsap.fromTo(
            numerals,
            { yPercent: 14 },
            { yPercent: -14, ease: EASE.scrub, scrollTrigger: through },
          );
        }

        if (fills.length) {
          gsap
            .timeline({ scrollTrigger: through })
            .fromTo(fills, { opacity: 0 }, { opacity: 1, ease: EASE.scrub, duration: 1 })
            .to(fills, { opacity: 0, ease: EASE.scrub, duration: 1 });
        }

        if (lights.length) {
          gsap
            .timeline({ scrollTrigger: through })
            .fromTo(
              lights,
              { xPercent: -12, yPercent: 16 },
              { xPercent: 12, yPercent: -16, ease: EASE.scrub, duration: 2 },
              0,
            )
            .fromTo(lights, { opacity: 0 }, { opacity: 1, ease: EASE.scrub, duration: 1 }, 0)
            .to(lights, { opacity: 0, ease: EASE.scrub, duration: 1 }, 1);
        }
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
