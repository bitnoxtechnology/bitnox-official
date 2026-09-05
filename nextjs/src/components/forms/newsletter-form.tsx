"use client";

import { SpamGuard } from "@/components/forms/spam-guard";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { subscribeAction } from "@/lib/actions/newsletter-actions";
import { subscribeSchema, type SubscribeInput } from "@/lib/validations/newsletter-schema";
import { cn } from "@/lib/utils";

/**
 * The newsletter signup, used in the footer and wherever else a post can be offered.
 *
 * One field. Every extra box on a signup form costs subscribers, and a name is not needed to
 * send an email to an address.
 *
 * `source` records which page the signup came from, so the list can tell a footer
 * subscription from one taken at the end of a blog post. It is a hidden input rather than
 * something the visitor sees, and the server treats it as a label and nothing more.
 *
 * On success the form is replaced by the confirmation rather than sitting there with a
 * message beside it, because leaving a filled-in input on screen invites a second submission
 * of the same address.
 *
 * The field id is derived from `source` rather than fixed, because a blog post carries this
 * form twice: once under the last paragraph and once in the footer. Two inputs sharing an id
 * make the second label point at the first input, so tapping one label focuses the wrong box
 * and a screen reader reads the same field twice.
 */
export function NewsletterForm({ source, className }: { source: string; className?: string }) {
  const fieldId = `newsletter-email-${source}`;
  const { form, state, pending, submit } = useActionForm<SubscribeInput>({
    schema: subscribeSchema,
    action: subscribeAction,
    defaultValues: { email: "" },
  });

  const { errors } = form.formState;

  if (state.status === "success") {
    return (
      <p className={cn("text-primary text-sm", className)} role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={submit} className={cn("grid gap-3", className)} noValidate>
      <SpamGuard />
      <input type="hidden" name="source" value={source} />

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor={fieldId}>Email address</FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={fieldId}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            className="h-10 sm:flex-1"
            {...form.register("email")}
          />
          <SubmitButton pending={pending} pendingLabel="Adding" className="sm:w-auto sm:px-5">
            Subscribe
          </SubmitButton>
        </div>
        <FieldError errors={[errors.email]} />
      </Field>

      {state.status === "error" && state.message ? (
        <p className="text-destructive text-sm" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
