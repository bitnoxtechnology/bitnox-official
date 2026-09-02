import type { ReactNode } from "react";

import { GlassCard } from "@/components/site/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Heading, one line of explanation, then the form.
 *
 * The explanation is the part worth keeping: every one of these screens is a step in a flow,
 * and a person who has just been sent here from their email needs to know which step.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <GlassCard asChild padding="md">
      <section>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
        <div className="mt-7">{children}</div>
        {footer ? <div className="mt-6 text-sm">{footer}</div> : null}
      </section>
    </GlassCard>
  );
}

/**
 * The card's shape while a screen waits on the request.
 *
 * Used by the two screens whose heading depends on whether the link in the email is still
 * good, so it cannot be written until the token has been read. It matches the real card's
 * padding and rhythm, so the content does not jump when it arrives.
 */
export function AuthCardSkeleton() {
  return (
    <GlassCard asChild padding="md">
      <section aria-hidden>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <div className="mt-8 space-y-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    </GlassCard>
  );
}
