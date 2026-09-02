import type { z } from "zod";

/**
 * The shape every server action returns to `useActionState`.
 *
 * One shape across the app means one way to render an error, and it keeps the actions honest:
 * a failure is a returned value, not an exception, so the form redisplays with its input
 * intact instead of hitting an error boundary.
 */

export interface ActionState {
  status: "idle" | "error" | "success";
  message?: string;
  /** Keyed by field name, so a form can show the message under the input it belongs to. */
  fieldErrors?: Record<string, string[]>;
}

export const idleState: ActionState = { status: "idle" };

export function errorState(message: string, fieldErrors?: Record<string, string[]>): ActionState {
  return { status: "error", message, fieldErrors };
}

export function successState(message?: string): ActionState {
  return { status: "success", message };
}

/** Zod issues flattened to the field map the forms expect. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (errors[key] ??= []).push(issue.message);
  }

  return errors;
}
