"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { EASE, MOTION_OK, useGsapEffect } from "./gsap";

type ScrollIndexProps = React.ComponentProps<"div"> & {
  /** Render the child element instead of a wrapping div, so an index can be a `<section>`. */
  asChild?: boolean;
  /** Opacity of the items that are not the current one. */
  rest?: number;
};

/**
 * A list read one item at a time, with a counter that follows the reader.
 *
 * For a column of rows beside a sticky heading: the values on the about page. As each row
 * passes the middle of the viewport it becomes the current one, the rows around it fall back
 * to a lower weight, and a large numeral in the sticky column rolls to its number. It is the
 * effect of a book with the chapter number in the margin, driven by scroll rather than by a
 * click, and it is what stops a stack of four ruled rows reading as a list of bullet points.
 *
 * Like `ScrollScene`, it finds its parts by `data-index` role in its subtree, so the rows and
 * the counter stay server-rendered markup and the page decides what each one is:
 *
 * - `item`: one row. The first is current until the reader reaches the second. The current
 *   one is at full opacity and the rest sit at `rest`.
 * - `counter`: a column of numerals, one per item, inside a mask one line tall. The column
 *   moves so the current item's numeral is the one showing; with the mask on the parent the
 *   move reads as the digits rolling. Needs `data-index="digit"` on each numeral so the
 *   column can be measured in units of one.
 * - `progress`: a line that draws from its top edge as the reader moves from the first row
 *   to the last. Scrubbed, so it is the reader's position rather than an animation. Needs
 *   `origin-top`.
 *
 * Everything is set against the server-rendered state as the finished one: every row at full
 * opacity, the counter on the first numeral, the progress line fully drawn. With JavaScript
 * off, under reduced motion, or before GSAP lands, the list is simply a list.
 */
export function ScrollIndex({
  asChild = false,
  rest = 0.32,
  className,
  children,
  ...props
}: ScrollIndexProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot.Root : "div";

  useGsapEffect(
    (gsap) => {
      const root = ref.current;
      if (!root) return;

      const role = (name: string) =>
        gsap.utils.toArray<HTMLElement>(`[data-index="${name}"]`, root);

      const items = role("item");
      const counters = role("counter");
      const progress = role("progress");

      if (items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        let current = -1;

        const activate = (index: number) => {
          if (index === current) return;
          current = index;

          items.forEach((item, i) => {
            gsap.to(item, {
              opacity: i === index ? 1 : rest,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
          });

          // The column is `items.length` lines tall, so one line is that fraction of it.
          counters.forEach((counter) => {
            gsap.to(counter, {
              yPercent: -(100 * index) / items.length,
              duration: 0.7,
              ease: "power3.inOut",
              overwrite: "auto",
            });
          });
        };

        // An empty timeline per row is the typed way to own a ScrollTrigger from here; the
        // plugin itself is registered inside `loadGsap` and never imported by a primitive.
        const triggers = items.map((item, index) => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 55%",
              end: "bottom 55%",
              onToggle: (self) => {
                if (self.isActive) activate(index);
              },
            },
          });

          return timeline.scrollTrigger;
        });

        // A reader who arrives mid-list, from a hash or a restored scroll position, should
        // land on the row they are looking at rather than on the first one.
        const initial = triggers.findIndex((trigger) => trigger?.isActive);
        const passed = triggers.filter((trigger) => (trigger?.progress ?? 0) >= 1).length;
        activate(initial >= 0 ? initial : Math.max(0, Math.min(passed, items.length - 1)));

        if (progress.length) {
          gsap.fromTo(
            progress,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: EASE.scrub,
              scrollTrigger: {
                trigger: items[0],
                endTrigger: items[items.length - 1],
                start: "top 55%",
                end: "bottom 55%",
                scrub: 0.3,
              },
            },
          );
        }
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [rest] },
  );

  return (
    <Comp ref={ref} className={cn(className)} {...props}>
      {children}
    </Comp>
  );
}
