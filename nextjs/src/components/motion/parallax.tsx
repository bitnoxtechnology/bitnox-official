"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { EASE, MOTION_OK, useGsapEffect } from "./gsap";

type ParallaxProps = React.ComponentProps<"div"> & {
  /**
   * How far the content drifts, as a percentage of its own height, in each direction. The
   * content travels from `-speed%` to `+speed%` across the full scroll through the section.
   *
   * Keep it small. Above about 15 the element visibly detaches from the page and the effect
   * stops reading as depth and starts reading as a bug. The legacy WhyUs section ran at
   * roughly 30 with `scrub: 1.5`, which lagged behind the scroll and looked broken on a
   * trackpad.
   */
  speed?: number;
  /** Drift horizontally instead. For wide bands and marquee-style rows. */
  axis?: "y" | "x";
};

/**
 * Scroll-linked drift.
 *
 * The child moves at a slightly different rate from the page as the element passes through
 * the viewport. Used behind a heading or on a large image, never on text a person is
 * expected to read while it moves.
 *
 * `scrub: true` ties the position to the scroll bar exactly, with no easing and no lag.
 * `ease: "none"` is required with it: any other curve fights the scroll input and produces
 * the rubber-band feel the legacy version had.
 *
 * Give the parent `overflow-hidden` when the drift would otherwise push content past a
 * boundary, and oversize the child (`h-[115%]` on an image, for example) so the drift never
 * exposes an edge.
 */
export function Parallax({ speed = 8, axis = "y", className, children, ...props }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  useGsapEffect(
    (gsap) => {
      const element = ref.current;
      if (!element) return;

      const property = axis === "y" ? "yPercent" : "xPercent";
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          element,
          { [property]: -speed },
          {
            [property]: speed,
            ease: EASE.scrub,
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [speed, axis] },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)} {...props}>
      {children}
    </div>
  );
}
