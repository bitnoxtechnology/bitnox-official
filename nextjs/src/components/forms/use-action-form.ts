"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useRef, useTransition, type FormEvent } from "react";
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
  /**
   * Pass to the form's `onSubmit` prop, never to `action`.
   *
   * The type is what enforces that: `action` takes a function of `FormData`, this one takes a
   * submit event, so `action={submit}` does not typecheck. See the note on `submit` below for
   * why the distinction matters.
   */
  submit: (event: FormEvent<HTMLFormElement>) => void;
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
  /**
   * Empty the form once the server confirms a success.
   *
   * True for the forms whose next use starts from nothing, an invitation or a password
   * change. False, and default, for every form that edits a record and stays on screen: there,
   * clearing the fields after a save reads as the save having lost the content.
   */
  resetOnSuccess?: boolean;
  /**
   * A last chance to add to the posted `FormData`, run after the client-side pass has
   * succeeded and before the action is dispatched.
   *
   * For a value that is read at submit time rather than rendered into the form. The sign-in
   * forms take `next` from the address bar on purpose, so that nothing on the page depends on
   * `searchParams` and the form is not held behind a Suspense fallback; there is therefore no
   * input for `FormData` to pick it up from.
   */
  prepare?: (formData: FormData) => void;
}): ActionForm<TValues> {
  const [state, dispatch, actionPending] = useActionState(options.action, idleState);
  const [transitionPending, startTransition] = useTransition();

  const form = useForm<TValues>({
    resolver: zodResolver(options.schema) as Resolver<TValues>,
    defaultValues: options.defaultValues,
    mode: "onBlur",
  });

  const { setError, reset } = form;

  /**
   * One event per success, not one per render.
   *
   * The event is written as an object literal at the call site, so its identity changes on
   * every render and this effect runs again each time. The flag is what makes that harmless:
   * a success that stays on screen reports one conversion, and the flag clears when the form
   * leaves the success state, so a second submission is reported again.
   */
  const { analytics, resetOnSuccess } = options;
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
    if (state.status === "success" && resetOnSuccess) reset();
  }, [state, resetOnSuccess, reset]);

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;

    for (const [field, messages] of Object.entries(state.fieldErrors)) {
      const message = messages[0];
      if (message) setError(field as Path<TValues>, { type: "server", message });
    }
  }, [state, setError]);

  /**
   * Submitted through `onSubmit`, and deliberately not through `<form action>`.
   *
   * React resets an uncontrolled form once a function passed to `action` returns. React Hook
   * Form writes its default values straight onto each input's `value` and never onto
   * `defaultValue`, so what the browser resets those inputs back to is the empty string. On a
   * form that redirects away the reset is invisible. On one that edits a record and stays on
   * screen, every registered field goes blank the moment a save succeeds, which reads as the
   * save having thrown the content away.
   *
   * The second failure is the one that actually lost data. The fields go blank but the hook's
   * own values do not, so the next save passes the client-side check against the values it
   * still holds and posts the empty inputs. Optional fields are then written empty and
   * required ones are rejected by the server, which is a save that appears to do nothing at
   * all. The SEO title and the meta description on the project form were being emptied exactly
   * this way, one save after the value was typed.
   *
   * `preventDefault` here is what stops the reset, because the reset belongs to the action
   * path and this submission never enters it. `FormData` is still read from the form element,
   * rather than assembled from the hook's values, so the fields no component registers, the
   * honeypot and the timestamp on the public forms, still reach the server. It is read
   * synchronously because `currentTarget` is null by the time the validation promise settles.
   */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // `trigger` is async, so the dispatch happens after an await and needs its own
    // transition. Without one React warns that the action was dispatched outside a
    // transition and the pending flag never turns on.
    void form.trigger().then((valid) => {
      if (!valid) {
        /**
         * `trigger` validates and stops there. `handleSubmit`, which this does not use because
         * the action wants `FormData` rather than parsed values, would also move to the first
         * field that failed. Without that step a refused save looks like a button that does
         * nothing: the message exists, and it is wherever on the page that field happens to be.
         * Nothing happens for a field no component registered, an image field's hidden input
         * among them, which is why those render their message beside the control instead.
         */
        const [first] = Object.keys(form.formState.errors);
        if (first) form.setFocus(first as Path<TValues>);

        return;
      }

      options.prepare?.(formData);
      startTransition(() => dispatch(formData));
    });
  };

  return { form, state, pending: actionPending || transitionPending, submit };
}
