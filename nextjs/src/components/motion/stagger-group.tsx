"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { ENTER, EASE, MOTION_OK, useGsapEffect } from "./gsap";

type StaggerGroupProps = React.ComponentProps<"div"> & {
  /**
   * CSS selector for the items to stagger, scoped to this group. Defaults to the direct
   * children, which is what a card grid or a list wants. Pass a selector when the items sit
   * one level deeper, such as `"li"` inside a `<ul>` wrapper.
   */
  selector?: string;
  /** Seconds between one item starting and the next. */
  stagger?: number;
  delay?: number;
  y?: number;
  duration?: number;
  start?: string;
  /**
   * Stagger from the centre of the group outwards rather than left to right. Suits a
   * symmetrical row; wrong for anything the eye reads in order.
   */
  from?: "start" | "center" | "end";
  /**
   * How each item arrives.
   *
   * `rise` is the default fade-up. `curtain` is for photographs: the item is unmasked from
   * the bottom edge upward while the picture inside it, marked `data-stagger-media`, settles
   * from slightly enlarged to its resting size. The two together read as a print being
   * lifted off a stack, and neither touches opacity, so the image never half-shows through
   * itself the way a fading photograph does.
   */
  effect?: "rise" | "curtain";
  /** Render the child element instead of a wrapping div, so a group can be a `<ul>`. */
  asChild?: boolean;
};

/**
 * A set of siblings entering one after another.
 *
 * Card grids, stat rows, nav items, list items. The trigger is the group, not each item, so
 * the sequence runs once as a wave rather than firing per card as each one crosses the line,
 * which is what made the legacy portfolio grid look uneven on a wide screen.
 */
export function StaggerGroup({
  selector,
  stagger = ENTER.stagger,
  delay = 0,
  y = ENTER.y,
  duration = ENTER.duration,
  start = ENTER.start,
  from = "start",
  effect = "rise",
  asChild = false,
  className,
  children,
  ...props
}: StaggerGroupProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot.Root : "div";

  useGsapEffect(
    (gsap) => {
      const group = ref.current;
      if (!group) return;

      const items = selector
        ? gsap.utils.toArray<HTMLElement>(selector, group)
        : Array.from(group.children);

      if (items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (effect === "curtain") {
          const media = items.flatMap((item) =>
            gsap.utils.toArray<HTMLElement>("[data-stagger-media]", item),
          );

          // One timeline, one trigger. The mask and the settle start together per item and
          // the settle runs longer, so the picture is still easing to rest as the next one
          // starts to open, which is what keeps four of them from reading as a mechanism.
          gsap
            .timeline({ delay, scrollTrigger: { trigger: group, start, once: true } })
            .fromTo(
              items,
              { clipPath: "inset(100% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: duration * 1.5,
                ease: "power4.inOut",
                stagger: { each: stagger * 2, from },
              },
              0,
            )
            .fromTo(
              media,
              { scale: 1.18 },
              {
                scale: 1,
                duration: duration * 2.2,
                ease: EASE.enter,
                stagger: { each: stagger * 2, from },
              },
              0,
            );

          return;
        }

        gsap.from(items, {
          opacity: 0,
          y,
          duration,
          delay,
          ease: EASE.enter,
          stagger: { each: stagger, from },
          scrollTrigger: { trigger: group, start, once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [selector, stagger, delay, y, duration, start, from, effect] },
  );

  return (
    <Comp ref={ref} className={cn(className)} {...props}>
      {children}
    </Comp>
  );
}
