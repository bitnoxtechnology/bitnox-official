"use client";

import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A submit button that says what it is doing.
 *
 * Disabled while the action runs, which is the only guard against a double submission that
 * would consume a one-time code twice.
 *
 * It used to repaint the cyan and the dark ink on top of the default variant, using the
 * literal brand utilities. Phase 4 mapped `--primary` onto the cyan, so the variant already
 * paints exactly that, and the overrides were a second copy of the same decision that would
 * have gone stale the first time the primary colour moved. All that is left here is the
 * shape a form submit wants: full width, and taller than the default control height.
 *
 * The class names are described rather than quoted on purpose. Tailwind scans source files
 * as text and cannot tell a comment from markup, so spelling them out here would keep
 * generating the two rules this change exists to remove.
 */
export function SubmitButton({
  pending,
  children,
  pendingLabel,
  className,
  ...props
}: ComponentProps<typeof Button> & { pending: boolean; pendingLabel: string }) {
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn("h-10 w-full", className)}
      {...props}
    >
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
