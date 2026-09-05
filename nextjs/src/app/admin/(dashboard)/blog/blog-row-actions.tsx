"use client";

import Link from "next/link";
import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import {
  deleteBlogAction,
  duplicateBlogAction,
  getPreviewLinkAction,
  setBlogStatusAction,
} from "@/lib/actions/blog-actions";
import { PUBLISH_STATUSES, type PublishStatus } from "@/lib/constants";

/**
 * The per-row menu on the blog list.
 *
 * A menu rather than five buttons in the cell. Edit is the common action and it is the row's
 * own link; everything else here is occasional, and a row of icons for occasional actions is a
 * row that makes the table harder to read for the sake of things nobody does daily.
 *
 * Status is set from here as well as from the form, because moving four posts out of draft
 * should not mean opening four editors.
 */

const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Move to draft",
  scheduled: "Schedule",
  published: "Publish",
  archived: "Archive",
};

export function BlogRowActions({
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

  async function preview() {
    window.open(await getPreviewLinkAction(slug), "_blank", "noopener");
  }

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
          <Link href={`/admin/blog/${id}`}>
            <Pencil aria-hidden />
            Edit
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => void preview()}>
          <Eye aria-hidden />
          Preview
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => run(() => duplicateBlogAction(id), { success: "Copied as a new draft." })}
        >
          <Copy aria-hidden />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs">Status</DropdownMenuLabel>

        {PUBLISH_STATUSES.filter((value) => value !== status).map((value) => (
          <DropdownMenuItem
            key={value}
            onSelect={() =>
              run(() => setBlogStatusAction(id, value), { success: `Moved to ${value}.` })
            }
          >
            {STATUS_LABELS[value]}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <ConfirmAction
          title={`Delete "${title}"?`}
          description="The post and its URL go for good. Archiving keeps both and only stops it being published."
          confirmLabel="Delete the post"
          onConfirm={() => deleteBlogAction(id)}
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
