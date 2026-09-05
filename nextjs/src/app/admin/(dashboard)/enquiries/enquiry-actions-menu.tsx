"use client";

import { Check, Mail, MoreHorizontal, Trash2 } from "lucide-react";

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
import { deleteEnquiryAction, setEnquiryStatusAction } from "@/lib/actions/enquiry-actions";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/constants";

/**
 * What can be done to one enquiry.
 *
 * Three states rather than a "done" checkbox. `read` separates a message somebody has looked at
 * from one that has actually been answered, which is the distinction between an inbox and a
 * pile, and it is the state the badge in the sidebar counts against.
 *
 * Replying opens the mail client with the address and the subject filled in. There is no reply
 * box here on purpose: a reply sent from the site would come from the site's own sending domain
 * and land in a thread nobody at Bitnox can see, and the conversation belongs in the mailbox
 * the enquiry was going to be answered from anyway.
 */

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "Mark as new",
  read: "Mark as read",
  responded: "Mark as responded",
};

export function EnquiryActionsMenu({
  id,
  name,
  email,
  subject,
  status,
  onDeleted,
}: {
  id: string;
  name: string;
  email: string;
  subject?: string;
  status: EnquiryStatus;
  /** Where to go after a delete, when the menu is on a detail page rather than a row. */
  onDeleted?: string;
}) {
  const { run, pending } = useServerAction();

  const mailto = `mailto:${email}?subject=${encodeURIComponent(
    subject ? `Re: ${subject}` : "Your enquiry to Bitnox",
  )}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          aria-label={`Actions for ${name}`}
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <a href={mailto}>
            <Mail aria-hidden />
            Reply by email
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs">Status</DropdownMenuLabel>

        {ENQUIRY_STATUSES.filter((value) => value !== status).map((value) => (
          <DropdownMenuItem
            key={value}
            onSelect={() =>
              run(() => setEnquiryStatusAction(id, value), { success: `Marked as ${value}.` })
            }
          >
            {value === "responded" ? <Check aria-hidden /> : null}
            {STATUS_LABELS[value]}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <ConfirmAction
          title={`Delete the enquiry from ${name}?`}
          description="This is somebody's message and it goes for good. Marking it as responded is what to use when it has simply been dealt with."
          confirmLabel="Delete it"
          onConfirm={async () => {
            const result = await deleteEnquiryAction(id);
            if (result.ok && onDeleted) window.location.assign(onDeleted);
            return result;
          }}
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
