import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import type { EnquiryStatus, PublishStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The heading block every admin screen opens with.
 *
 * One `h1`, an optional line saying what the screen is for, and the actions that belong to the
 * page rather than to a row. Having it in one place is what stops six screens each inventing
 * their own margin above the title.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-foreground font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-6">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

/**
 * A publish status, said in one word and coloured by what it means.
 *
 * Four states rather than a boolean, which is the whole reason this component exists: a green
 * dot and a grey dot cannot distinguish a draft from an archived post, and those are two very
 * different things to see on a row.
 */
const PUBLISH_LABELS: Record<
  PublishStatus,
  { label: string; variant: "default" | "outline" | "secondary" | "ghost" }
> = {
  draft: { label: "Draft", variant: "outline" },
  scheduled: { label: "Scheduled", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "ghost" },
};

export function StatusBadge({ status }: { status: PublishStatus }) {
  const { label, variant } = PUBLISH_LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

const ENQUIRY_LABELS: Record<
  EnquiryStatus,
  { label: string; variant: "default" | "outline" | "ghost" }
> = {
  new: { label: "New", variant: "default" },
  read: { label: "Read", variant: "outline" },
  responded: { label: "Responded", variant: "ghost" },
};

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  const { label, variant } = ENQUIRY_LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

/**
 * What a list says when it has nothing in it.
 *
 * A sentence and the button that fixes it, not a shrug. An admin looking at an empty portfolio
 * needs to know whether the filter is hiding everything or whether nothing has been written
 * yet, so the two cases get different copy from the pages that use this.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border/60 rounded-xl border border-dashed px-6 py-16 text-center">
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
