"use client";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/lib/actions/auth-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth-schema";

export function ChangePasswordForm() {
  const { form, state, pending, submit } = useActionForm<ChangePasswordInput>({
    schema: changePasswordSchema,
    action: changePasswordAction,
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const { errors } = form.formState;

  return (
    <form action={submit} className="space-y-6" noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.currentPassword)}>
          <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.currentPassword)}
            {...form.register("currentPassword")}
          />
          <FieldError errors={[errors.currentPassword]} />
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
          <FieldDescription>
            At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.
          </FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
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

      <SubmitButton pending={pending} pendingLabel="Saving" className="sm:w-auto sm:px-6">
        Change password
      </SubmitButton>
    </form>
  );
}
