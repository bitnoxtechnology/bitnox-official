"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { MOTION_OK, gsap, useGSAP } from "@/components/motion/gsap";

type StatCounterProps = {
  /**
   * The figure. A number counts up; a string is rendered as-is, for the cases where the
   * stat is not a quantity.
   *
   * Whatever goes here has to be true and checkable. The legacy hero carried "50+ Projects
   * Completed" and "30+ Happy Clients" with nothing behind either, which is exactly the
   * fabricated social proof the copy standards rule out. Real numbers only: the Event
   * Space seats 60, and that one is verifiable by walking into the room.
   */
  value: number | string;
  /** What the figure counts. Sentence case, no full stop. */
  label: string;
  prefix?: string;
  suffix?: string;
  /** Decimal places to hold steady while counting, so the width does not jump. */
  decimals?: number;
  duration?: number;
  className?: string;
};

/**
 * A figure that counts up when it scrolls into view.
 *
 * Ported from the legacy hero metrics, with two changes. The original started the count on a
 * fixed half-second delay whether or not the numbers were on screen, so on a phone they had
 * finished before the visitor scrolled to them. This one starts when the figure is actually
 * visible. The original also ran for two seconds, which is long enough to notice the wait;
 * 1.4 lands while the eye is still on it.
 *
 * The finished value is what the server renders, so the number is in the HTML for a crawler
 * and for a visitor with JavaScript off, and it is what stays on screen under reduced
 * motion. The zero start is written in a layout effect, before the browser paints.
 */
export function StatCounter({
  value,
  label,
  prefix,
  suffix,
  decimals = 0,
  duration = 1.4,
  className,
}: StatCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);

  const format = React.useCallback(
    (n: number) =>
      n.toLocaleString("en-GB", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals],
  );

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || typeof value !== "number") return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const counter = { current: 0 };
        element.textContent = format(0);

        gsap.to(counter, {
          current: value,
          duration,
          ease: "power1.inOut",
          scrollTrigger: { trigger: element, start: "top 90%", once: true },
          onUpdate: () => {
            element.textContent = format(counter.current);
          },
          onComplete: () => {
            element.textContent = format(value);
          },
        });
      });

      return () => {
        mm.revert();
        element.textContent = format(value);
      };
    },
    { scope: ref, dependencies: [value, duration, format] },
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-foreground text-4xl font-semibold tabular-nums sm:text-5xl">
        {prefix ? <span className="text-primary">{prefix}</span> : null}
        <span ref={ref}>{typeof value === "number" ? format(value) : value}</span>
        {suffix ? <span className="text-primary">{suffix}</span> : null}
      </p>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
