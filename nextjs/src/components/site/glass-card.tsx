import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

type GlassCardProps = React.ComponentProps<"div"> & {
  /**
   * Lift and brighten the hairline on hover. Only for a card that is itself a link or a
   * button. A card that does not respond to a click must not respond to a hover either.
   */
  interactive?: boolean;
  /** Render as the child element, so a card can be an `<a>` or an `<article>`. */
  asChild?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const PADDING = {
  none: "",
  sm: "p-5",
  md: "p-6 sm:p-7",
  lg: "p-7 sm:p-9",
} as const;

/**
 * The panel treatment, as a component.
 *
 * The `.glass` utility is the surface; this adds the radius, the padding scale and the
 * hover behaviour, so the fifty cards on this site agree on all four.
 *
 * There is no glow, no gradient border and no coloured shadow. The hairline is the cyan at
 * 15% and that is the whole of the brand's presence on a resting card. On a dark ground a
 * 1px line at low opacity is already a strong edge, and adding a bloom behind it is what
 * makes a dark interface look like a template.
 */
export function GlassCard({
  interactive = false,
  asChild = false,
  padding = "md",
  className,
  ...props
}: GlassCardProps) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="glass-card"
      className={cn(
        "glass rounded-xl",
        PADDING[padding],
        interactive &&
          "hover:border-primary/35 focus-visible:border-primary/50 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--glass-bg)_88%,var(--primary)_12%)]",
        className,
      )}
      {...props}
    />
  );
}
