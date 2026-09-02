"use client";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm, type FormAction } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth-schema";

/**
 * Choosing a password from a one-time link.
 *
 * Accepting an invitation and completing a reset are the same form with a different action
 * behind it and a different word on the button, so they are one component. The two schemas
 * are identical in shape, which is why one drives both.
 */
export function SetPasswordForm({
  token,
  action,
  submitLabel,
  pendingLabel,
}: {
  token: string;
  action: FormAction;
  submitLabel: string;
  pendingLabel: string;
}) {
  const { form, state, pending, submit } = useActionForm<ResetPasswordInput>({
    schema: resetPasswordSchema,
    action,
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const { errors } = form.formState;

  return (
    <form action={submit} className="space-y-6" noValidate>
      <input type="hidden" {...form.register("token")} />

      <FieldGroup>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
          <FieldDescription>
            At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.
          </FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...form.register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
