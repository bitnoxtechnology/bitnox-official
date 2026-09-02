"use client";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordResetAction } from "@/lib/actions/auth-actions";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/validations/auth-schema";

export function ForgotPasswordForm() {
  const { form, state, pending, submit } = useActionForm<RequestPasswordResetInput>({
    schema: requestPasswordResetSchema,
    action: requestPasswordResetAction,
    defaultValues: { email: "" },
  });

  const { errors } = form.formState;
  const sent = state.status === "success";

  return (
    <form action={submit} className="space-y-6" noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Sending">
        {sent ? "Send another link" : "Email me a reset link"}
      </SubmitButton>
    </form>
  );
}
