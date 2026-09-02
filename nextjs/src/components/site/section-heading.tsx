import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** The short label above the heading. Optional, and usually better left off. */
  eyebrow?: string;
  /** The heading itself. A sentence or a claim, not a single abstract noun. */
  title: ReactNode;
  /** One or two lines that say what the section covers. Optional. */
  description?: ReactNode;
  /** Heading rank. There is one `h1` per page, so sections are `h2` by default. */
  as?: "h1" | "h2" | "h3";
  align?: "start" | "center";
  className?: string;
};

/**
 * The heading block that opens a section.
 *
 * Every band of content on the site starts with one of these, which is the point: the
 * spacing between eyebrow, heading and description is decided once here rather than
 * re-guessed on each page, and that consistency is most of what makes a layout look
 * deliberate.
 *
 * The description is capped at reading measure even when the section below it is full
 * width, because a line of body copy running the width of a 1440px screen is unreadable.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  align = "start",
  className,
}: SectionHeadingProps) {
  const centred = align === "center";

  return (
    <div className={cn("max-w-3xl", centred && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
      ) : null}

      <Tag
        className={cn("text-foreground font-semibold", Tag === "h3" ? "text-2xl" : "text-section")}
      >
        {title}
      </Tag>

      {description ? (
        <p className={cn("text-muted-foreground text-lead mt-stack measure", centred && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
