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

/**
 * The shape every server action that is *not* a form returns.
 *
 * `ActionState` above exists for `useActionState`, which needs a single value that can also
 * be the initial one, so it has no room for a payload. The admin screens need the payload:
 * a create returns the new id so the page can navigate to it, a reorder returns the applied
 * order so the optimistic UI can settle. Hence a second shape, discriminated on `ok` so that
 * TypeScript narrows `data` for you inside the success branch.
 *
 * Both shapes carry the same `message` and `fieldErrors`, so `toActionState` below converts
 * one into the other and a single action can serve both a form and a button.
 */
export type ActionResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail<T = never>(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return { ok: false, message, fieldErrors };
}

/** The one message every failed parse uses, so forms do not each invent their own. */
export const INVALID_FORM = "Check the highlighted fields and try again.";

/**
 * Parse once, and get back something an action can return directly on failure.
 *
 * This is the field-level error mapping in one place. Without it every action repeats the
 * same four lines, and the ones written later spell the message differently from the ones
 * written first.
 */
export function validate<T>(
  schema: { safeParse: (input: unknown) => z.ZodSafeParseResult<T> },
  input: unknown,
): ActionResult<T> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) return fail(INVALID_FORM, fieldErrorsFrom(parsed.error));

  return ok(parsed.data);
}

/** For an action that serves a `useActionState` form and returns `ActionResult` internally. */
export function toActionState(result: ActionResult<unknown>, successMessage?: string): ActionState {
  if (!result.ok) return errorState(result.message, result.fieldErrors);
  return successState(result.message ?? successMessage);
}

/** Reads a text field out of `FormData` without the `File | string` union at every call. */
export function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
