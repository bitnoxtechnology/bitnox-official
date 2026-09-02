"use client";

import Link from "next/link";

import { nextFromLocation } from "@/app/admin/(auth)/next-param";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/actions/auth-actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth-schema";

export function LoginForm() {
  const { form, state, pending, submit } = useActionForm<LoginInput>({
    schema: loginSchema,
    action: loginAction,
    defaultValues: { email: "", password: "" },
  });

  const { errors } = form.formState;

  return (
    // `noValidate` hands validation to the shared schema. The browser's own messages say
    // different things in different browsers and cannot be styled.
    <form
      action={(formData) => {
        formData.set("next", nextFromLocation());
        submit(formData);
      }}
      className="space-y-6"
      noValidate
    >
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

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      </FieldGroup>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Checking">
        Continue
      </SubmitButton>

      <p className="text-center">
        <Link
          href="/admin/forgot-password"
          className="text-muted-foreground hover:text-primary text-sm transition-colors"
        >
          Forgotten your password?
        </Link>
      </p>
    </form>
  );
}
