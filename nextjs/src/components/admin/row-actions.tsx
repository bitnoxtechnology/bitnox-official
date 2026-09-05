"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/action-state";

/**
 * Running a server action from a row, and saying what happened.
 *
 * Every admin list has the same three buttons in different clothes: do the thing, tell me it
 * worked, refresh the table. Written per row that is thirty copies of a try/catch and a
 * `router.refresh()`, and the copies drift: one of them forgets to disable the button and gets
 * pressed twice, another swallows the failure and looks like it worked.
 *
 * The refresh is what makes the row update. The list pages are server components reading
 * uncached queries, so `router.refresh()` re-runs the query and re-renders the table with the
 * new value, without a full page load and without the page holding its own copy of the data.
 */

export function useServerAction() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const run = React.useCallback(
    (action: () => Promise<ActionResult<unknown>>, options?: { success?: string }) => {
      startTransition(async () => {
        const result = await action();

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        // The action's own message wins where it has one, since it can say what actually
        // happened ("three sessions were signed out") rather than a generic "Saved".
        const message = result.message ?? options?.success;
        if (message) toast.success(message);

        router.refresh();
      });
    },
    [router],
  );

  return { run, pending };
}

/**
 * A destructive action behind a confirmation.
 *
 * The dialog names the record rather than asking "are you sure?", because the mistake this
 * prevents is pressing delete on the wrong row, and a generic question does not help anybody
 * notice that. `AlertDialog` rather than `Dialog`: it traps focus on the cancel button and
 * cannot be dismissed by clicking away, which is what an irreversible action wants.
 */
export function ConfirmAction({
  title,
  description,
  confirmLabel,
  trigger,
  onConfirm,
  successMessage,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  trigger: React.ReactElement<{ onSelect?: (event: Event) => void; onClick?: () => void }>;
  onConfirm: () => Promise<ActionResult<unknown>>;
  successMessage?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const { run, pending } = useServerAction();

  return (
    <>
      {/*
       * The trigger is cloned rather than wrapped in `AlertDialogTrigger`. Most of these sit
       * inside a dropdown menu, and a Radix menu closes on select while the dialog is opening,
       * which unmounts the dialog with it. Opening from the select handler instead lets the
       * menu close first and the dialog open on its own.
       */}
      {React.cloneElement(trigger, {
        onSelect: (event: Event) => {
          event.preventDefault();
          setOpen(true);
        },
        onClick: () => setOpen(true),
      })}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(event) => {
                // Kept open until the action returns, so the row does not disappear from under
                // a dialog that is still working.
                event.preventDefault();
                run(onConfirm, { success: successMessage });
                setOpen(false);
              }}
            >
              {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * A button that runs an action and shows it running.
 *
 * For the reversible ones: duplicate a post, publish a project, restore an account. Anything
 * that cannot be undone goes through `ConfirmAction` above instead.
 */
export function ActionButton({
  action,
  successMessage,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  action: () => Promise<ActionResult<unknown>>;
  successMessage?: string;
}) {
  const { run, pending } = useServerAction();

  return (
    <Button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={() => run(action, { success: successMessage })}
      {...props}
    >
      {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  );
}
