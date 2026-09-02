"use client";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { inviteUserAction } from "@/lib/actions/auth-actions";
import { inviteUserSchema, type InviteUserInput } from "@/lib/validations/auth-schema";
import { cn } from "@/lib/utils";

/**
 * The invitation form.
 *
 * The role control is a native select rather than the shadcn one, which Phase 4 installs and
 * restyles. A two-option control did not justify pulling that forward.
 */
export function InviteForm() {
  const { form, state, pending, submit } = useActionForm<InviteUserInput>({
    schema: inviteUserSchema,
    action: inviteUserAction,
    defaultValues: { name: "", email: "", role: "admin" },
  });

  const { errors } = form.formState;

  return (
    <form action={submit} className="space-y-6" noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldDescription>The invitation link goes to this address.</FieldDescription>
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.role)}>
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <select
            id="role"
            className={cn(
              "border-input bg-input/30 text-brand-card h-9 w-full rounded-lg border px-3 text-sm",
              "focus-visible:border-brand focus-visible:ring-brand/40 focus-visible:ring-3 focus-visible:outline-none",
            )}
            aria-invalid={Boolean(errors.role)}
            {...form.register("role")}
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
          <FieldDescription>
            Super admins can invite and deactivate other admins. Give it out sparingly.
          </FieldDescription>
          <FieldError errors={[errors.role]} />
        </Field>
      </FieldGroup>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Sending" className="sm:w-auto sm:px-6">
        Send invitation
      </SubmitButton>
    </form>
  );
}
