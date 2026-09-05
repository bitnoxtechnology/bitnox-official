"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useRef, useTransition } from "react";
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
import { pushDataLayer, type DataLayerEvent } from "@/lib/analytics";

/**
 * One Zod schema, two consumers, wired up once.
 *
 * The schema validates in the browser for a fast message under the field, and again inside
 * the server action, which is the pass that decides anything. This hook holds the small
 * amount of glue that keeps both honest: the client check runs first and, if it fails, the
 * action is never dispatched; whatever the server rejects afterwards is written back onto the
 * same fields, so a server-side error and a client-side one look identical to the user.
 *
 * It is also where a form submission reaches analytics, for the same reason: every form on
 * the site goes through this hook, so the event fires in one place, only on a success the
 * server actually returned, and never on a validation failure or on a retry of one. A form
 * that reports a conversion the server rejected is worse than a form that reports nothing.
 */

export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export interface ActionForm<TValues extends FieldValues> {
  form: UseFormReturn<TValues>;
  state: ActionState;
  pending: boolean;
  /** Pass to the form's `action` prop. */
  submit: (formData: FormData) => void;
}

/**
 * `TValues` is the schema's *input* type, not its output.
 *
 * They are the same for most forms, and differ the moment a field carries a transform: an
 * optional field written as `.optional().transform(...)` accepts a missing key on the way in
 * and produces `string | undefined` on the way out. React Hook Form holds what the person
 * typed, which is the input side, so that is what this hook is typed against and what
 * `z.input<typeof schema>` gives a form.
 */
export function useActionForm<TValues extends FieldValues>(options: {
  schema: ZodType<unknown, TValues>;
  action: FormAction;
  defaultValues: DefaultValues<TValues>;
  /** Pushed to the `dataLayer` once, when the server returns a success. */
  analytics?: DataLayerEvent;
}): ActionForm<TValues> {
  const [state, dispatch, actionPending] = useActionState(options.action, idleState);
  const [transitionPending, startTransition] = useTransition();

  const form = useForm<TValues>({
    resolver: zodResolver(options.schema) as Resolver<TValues>,
    defaultValues: options.defaultValues,
    mode: "onBlur",
  });

  const { setError } = form;

  /**
   * One event per success, not one per render.
   *
   * The event is written as an object literal at the call site, so its identity changes on
   * every render and this effect runs again each time. The flag is what makes that harmless:
   * a success that stays on screen reports one conversion, and the flag clears when the form
   * leaves the success state, so a second submission is reported again.
   */
  const { analytics } = options;
  const reported = useRef(false);

  useEffect(() => {
    if (state.status !== "success") {
      reported.current = false;
      return;
    }

    if (reported.current || !analytics) return;

    reported.current = true;
    pushDataLayer(analytics);
  }, [state, analytics]);

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
