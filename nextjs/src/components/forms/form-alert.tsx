import { CircleAlert, CircleCheck } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/lib/actions/action-state";

/**
 * The one line a form says back to the person filling it in.
 *
 * Field-level problems appear under their fields. This is for what the server alone knows:
 * the code was wrong, the link expired, the invitation went out.
 */
export function FormAlert({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;

  const failed = state.status === "error";
  const Icon = failed ? CircleAlert : CircleCheck;

  return (
    <Alert
      variant={failed ? "destructive" : "default"}
      className={failed ? undefined : "border-primary/30 text-foreground"}
      // Announced to screen readers when it appears, rather than sitting there unread.
      role="status"
      aria-live="polite"
    >
      <Icon className={failed ? undefined : "text-primary"} />
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
