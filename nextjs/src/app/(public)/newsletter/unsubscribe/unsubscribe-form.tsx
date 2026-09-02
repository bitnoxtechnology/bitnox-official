"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/actions/action-state";
import { unsubscribeAction } from "@/lib/actions/newsletter-actions";

/**
 * A button and a hidden token, and nothing else.
 *
 * No schema resolver and no `useActionForm`, because there is no field to validate on the
 * client: the token comes from the link, not from typing. `useActionState` on its own is the
 * whole requirement.
 *
 * It is a form rather than a link that unsubscribes on page load. A mail client that
 * prefetches links would otherwise remove people from the list without them ever clicking.
 */
export function UnsubscribeForm({ token }: { token: string }) {
  const [state, dispatch, pending] = useActionState(unsubscribeAction, idleState);

  if (state.status === "success") {
    return <FormAlert state={state} />;
  }

  return (
    <form action={dispatch} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <FormAlert state={state} />
      <SubmitButton pending={pending} pendingLabel="Removing">
        Unsubscribe this address
      </SubmitButton>
    </form>
  );
}
