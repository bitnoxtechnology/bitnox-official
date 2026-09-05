import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The call to action every public page uses.
 *
 * One shape, so that "Start a project" in the hero, "See the portfolio" halfway down and
 * "Go to the home page" on a 404 are recognisably the same control. The header is the one
 * exception: its buttons stay on the compact default size, because a 56px pill inside a
 * navigation bar would set the height of the whole bar.
 *
 * It is a composite over the shadcn `Button` rather than an anchor styled by hand. Focus
 * ring, disabled state, the `asChild` slot and the pressed translate are all decided in the
 * primitive, and this only adds the three things that are particular to a marketing CTA: the
 * pill radius, the larger target, and the circular badge on the trailing edge.
 *
 * The badge inverts its parent's colours, which is what makes it read as a separate token
 * sitting inside the button: on the filled cyan button it is dark with a cyan arrow, on the
 * outlined one it is cyan with a dark arrow. Both pairs are the same two brand colours the
 * variants already use, so nothing here pins a new hex.
 *
 * `data-cta` is the marker `AnalyticsListener` looks for. It is an attribute rather than an
 * `onClick`, so this component and everything that renders it stay on the server: one
 * delegated listener in the public layout reads it from whatever was clicked.
 *
 * The arrow is decorative and marked `aria-hidden`. It says "this goes somewhere", which the
 * label has already said, and announcing "arrow up right" after every button is noise.
 *
 * Most of these are links. The exception is a retry on an error boundary, which performs an
 * action rather than navigating, so the props are a union: give it an `href` and it renders
 * an anchor, give it an `onClick` and it renders a real `button`. Neither case is a `div`
 * pretending to be either.
 */

interface BaseProps {
  children: ReactNode;
  /** `outline` is the quieter second action beside a primary one. At most one per pair. */
  variant?: "default" | "outline";
  /** Compact, for a card footer or a tight column. Same shape, smaller. */
  size?: "default" | "sm";
  className?: string;
}

type ActionButtonProps = BaseProps &
  (
    | {
        href: string;
        /** Set for links leaving this origin, such as the two sister properties. */
        external?: boolean;
        onClick?: never;
        type?: never;
      }
    | {
        href?: never;
        external?: never;
        onClick: () => void;
        type?: "button" | "submit";
      }
  );

export function ActionButton({
  children,
  variant = "default",
  size = "default",
  className,
  ...props
}: ActionButtonProps) {
  const compact = size === "sm";

  const content = (
    <>
      <span className={compact ? "pr-1" : "pr-2"}>{children}</span>
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-full transition-transform duration-300",
          // The badge lifts slightly on hover. It is the only movement, and it points the
          // same way as the arrow inside it.
          "group-hover/button:translate-x-px group-hover/button:-translate-y-px",
          compact ? "size-7" : "size-10",
          variant === "default"
            ? "bg-primary-foreground text-primary"
            : "bg-primary text-primary-foreground",
        )}
      >
        <ArrowUpRight className={compact ? "size-3.5" : "size-4"} />
      </span>
    </>
  );

  const shape = cn(
    "rounded-full font-medium",
    compact ? "h-11 gap-1.5 pr-2 pl-5 text-sm" : "h-14 gap-2 pr-2 pl-7 text-base",
    // The outline variant paints the page ground behind itself, which on a glass panel would
    // punch a flat rectangle through the blur. Transparent lets the surface show.
    variant === "outline" && "bg-transparent dark:bg-transparent",
    className,
  );

  if (props.href === undefined) {
    return (
      <Button
        type={props.type ?? "button"}
        variant={variant}
        onClick={props.onClick}
        className={shape}
        data-cta={variant === "outline" ? "secondary" : "primary"}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant={variant}
      className={shape}
      data-cta={variant === "outline" ? "secondary" : "primary"}
    >
      {props.external ? (
        <a href={props.href} rel="noopener">
          {content}
        </a>
      ) : (
        <Link href={props.href}>{content}</Link>
      )}
    </Button>
  );
}
