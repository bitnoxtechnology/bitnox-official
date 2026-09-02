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
      className={cn(
        "bg-brand text-brand-bg hover:bg-brand/90 focus-visible:ring-brand/40 h-10 w-full",
        className,
      )}
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
