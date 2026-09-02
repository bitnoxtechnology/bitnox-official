"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { ENTER, EASE, MOTION_OK, gsap, useGSAP } from "./gsap";

type RevealProps = React.ComponentProps<"div"> & {
  /** Seconds to wait after the trigger fires. For sequencing two neighbouring reveals. */
  delay?: number;
  /** Travel distance in pixels. Negative moves down into place instead of up. */
  y?: number;
  duration?: number;
  /** ScrollTrigger start position. Defaults to the element's top crossing 85% of the viewport. */
  start?: string;
  /**
   * Replay the entrance each time the element re-enters the viewport. Off by default: an
   * element that re-animates on every scroll past reads as a glitch rather than as polish.
   */
  repeat?: boolean;
  /**
   * Render the child element instead of a wrapping div, so a reveal can be a `<section>`,
   * an `<article>` or a grid item without an extra box in the tree changing the layout.
   */
  asChild?: boolean;
};

/**
 * One element fading up as it enters the viewport.
 *
 * The workhorse. Wrap a heading, a paragraph, a card, an image.
 *
 * The animation is a `from`, so the element's resting state is what the server rendered and
 * the start state is applied by GSAP before the first paint (`useGSAP` runs in a layout
 * effect). Nothing is hidden in the markup, which matters twice over: with JavaScript off,
 * or with reduced motion on, the content is simply there, and a crawler reading the HTML
 * sees a normal document rather than a page of invisible elements.
 */
export function Reveal({
  delay = 0,
  y = ENTER.y,
  duration = ENTER.duration,
  start = ENTER.start,
  repeat = false,
  asChild = false,
  className,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot.Root : "div";

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(element, {
          opacity: 0,
          y,
          duration,
          delay,
          ease: EASE.enter,
          scrollTrigger: {
            trigger: element,
            start,
            once: !repeat,
            toggleActions: repeat ? "play none none reverse" : "play none none none",
          },
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay, y, duration, start, repeat] },
  );

  return (
    <Comp ref={ref} className={cn(className)} {...props}>
      {children}
    </Comp>
  );
}
