"use client";

import Link from "next/link";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { ConfirmAction, useServerAction } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteProjectAction, setProjectStatusAction } from "@/lib/actions/portfolio-actions";
import { PUBLISH_STATUSES, type PublishStatus } from "@/lib/constants";

/** The same menu the blog list has, over the project actions. */
const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Move to draft",
  scheduled: "Schedule",
  published: "Publish",
  archived: "Archive",
};

export function ProjectRowActions({
  id,
  slug,
  title,
  status,
}: {
  id: string;
  slug: string;
  title: string;
  status: PublishStatus;
}) {
  const { run, pending } = useServerAction();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          aria-label={`Actions for ${title}`}
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={`/admin/portfolio/${id}`}>
            <Pencil aria-hidden />
            Edit
          </Link>
        </DropdownMenuItem>

        {status === "published" ? (
          <DropdownMenuItem asChild>
            <Link href={`/portfolio/${slug}`} target="_blank" rel="noopener">
              <ExternalLink aria-hidden />
              View it live
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs">Status</DropdownMenuLabel>

        {PUBLISH_STATUSES.filter((value) => value !== status).map((value) => (
          <DropdownMenuItem
            key={value}
            onSelect={() =>
              run(() => setProjectStatusAction(id, value), { success: `Moved to ${value}.` })
            }
          >
            {STATUS_LABELS[value]}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <ConfirmAction
          title={`Delete "${title}"?`}
          description="The case study and its URL go for good. Archiving keeps both and only stops it being published."
          confirmLabel="Delete the project"
          onConfirm={() => deleteProjectAction(id)}
          trigger={
            <DropdownMenuItem variant="destructive">
              <Trash2 aria-hidden />
              Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
