"use client";

import { MoreHorizontal, Trash2, UserMinus } from "lucide-react";

import { ConfirmAction, useServerAction } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteSubscriberAction,
  unsubscribeSubscriberAction,
} from "@/lib/actions/newsletter-actions";
import type { SubscriberStatus } from "@/lib/constants";

/**
 * Unsubscribe, and delete.
 *
 * Two different things, kept apart. Unsubscribing sets the status and keeps the row, which is
 * what remembers that this address asked to be left alone: an old spreadsheet re-imported later
 * cannot quietly put them back on. Deleting is for a spam signup and for a request to erase
 * personal data, and it is the one behind a confirmation.
 */
export function SubscriberActions({
  id,
  email,
  status,
}: {
  id: string;
  email: string;
  status: SubscriberStatus;
}) {
  const { run, pending } = useServerAction();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          aria-label={`Actions for ${email}`}
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {status === "subscribed" ? (
          <DropdownMenuItem onSelect={() => run(() => unsubscribeSubscriberAction(id))}>
            <UserMinus aria-hidden />
            Unsubscribe
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <ConfirmAction
          title={`Delete ${email}?`}
          description="The record goes for good, so a later import of the same address could put them back on the list. Unsubscribing is what keeps that from happening."
          confirmLabel="Delete the record"
          onConfirm={() => deleteSubscriberAction(id)}
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
