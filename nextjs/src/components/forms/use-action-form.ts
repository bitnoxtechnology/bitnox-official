"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useTransition } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";

import { idleState, type ActionState } from "@/lib/actions/action-state";

/**
 * One Zod schema, two consumers, wired up once.
 *
 * The schema validates in the browser for a fast message under the field, and again inside
 * the server action, which is the pass that decides anything. This hook holds the small
 * amount of glue that keeps both honest: the client check runs first and, if it fails, the
 * action is never dispatched; whatever the server rejects afterwards is written back onto the
 * same fields, so a server-side error and a client-side one look identical to the user.
 */

export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export interface ActionForm<TValues extends FieldValues> {
  form: UseFormReturn<TValues>;
  state: ActionState;
  pending: boolean;
  /** Pass to the form's `action` prop. */
  submit: (formData: FormData) => void;
}

export function useActionForm<TValues extends FieldValues>(options: {
  schema: ZodType<TValues, TValues>;
  action: FormAction;
  defaultValues: DefaultValues<TValues>;
}): ActionForm<TValues> {
  const [state, dispatch, actionPending] = useActionState(options.action, idleState);
  const [transitionPending, startTransition] = useTransition();

  const form = useForm<TValues>({
    resolver: zodResolver(options.schema) as Resolver<TValues>,
    defaultValues: options.defaultValues,
    mode: "onBlur",
  });

  const { setError } = form;

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;

    for (const [field, messages] of Object.entries(state.fieldErrors)) {
      const message = messages[0];
      if (message) setError(field as Path<TValues>, { type: "server", message });
    }
  }, [state, setError]);

  const submit = (formData: FormData) => {
    // `trigger` is async, so the dispatch happens after an await and needs its own
    // transition. Without one React warns that the action was dispatched outside a
    // transition and the pending flag never turns on.
    void form.trigger().then((valid) => {
      if (valid) startTransition(() => dispatch(formData));
    });
  };

  return { form, state, pending: actionPending || transitionPending, submit };
}
