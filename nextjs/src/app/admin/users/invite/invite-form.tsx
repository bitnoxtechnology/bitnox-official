"use client";

import { Controller } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUserAction } from "@/lib/actions/auth-actions";
import { inviteUserSchema, type InviteUserInput } from "@/lib/validations/auth-schema";

/**
 * The two roles, with the labels the form shows for them.
 *
 * One list drives the menu items and the closed trigger's label, so there is no second place
 * to edit when a role is renamed.
 */
const ROLES: { value: InviteUserInput["role"]; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super admin" },
];

/**
 * The invitation form.
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
          {/*
           * A Radix select is not a native `<select>`, so `form.register` has nothing to
           * attach to and the field goes through `Controller` instead. Two things then have
           * to be true at once, and both are: `name` on the root makes Radix render its
           * hidden native select, which is what puts the value in the `FormData` the server
           * action receives, and `onValueChange` writes the same value into react-hook-form
           * so the client-side Zod pass sees it.
           */}
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="role"
                  size="default"
                  className="h-9 w-full"
                  aria-invalid={Boolean(errors.role)}
                  onBlur={field.onBlur}
                >
                  {/*
                   * The label is passed rather than left for Radix to resolve. While the
                   * menu is closed Radix keeps the items in an off-document fragment that
                   * only exists after hydration, so a `<SelectValue />` with no children
                   * renders an empty trigger on the server and fills in a moment later.
                   */}
                  <SelectValue>
                    {ROLES.find((role) => role.value === field.value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
