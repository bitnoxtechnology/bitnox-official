import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

import { userService } from "@/lib/services/user-service";
import {
  updateUserSchema,
  type UpdateUserInput,
} from "@/lib/validations/user-validator";

interface Props {
  selected: IAdminUser;
  onUpdated?: () => void;
  onCleared?: () => void;
}

const inputClassName =
  "h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!";

const UpdateUserForm: React.FC<Props> = ({
  selected,
  onUpdated,
  onCleared,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      role: "admin",
    },
  });

  useEffect(() => {
    form.reset({
      name: selected.name,
      role: selected.role,
    });
  }, [selected, form]);

  const onSubmit = async (data: UpdateUserInput) => {
    setIsSubmitting(true);
    try {
      const payload: UpdateUserInput = {};
      if (data.name && data.name !== selected.name) payload.name = data.name;
      if (data.role && data.role !== selected.role) payload.role = data.role;

      if (!Object.keys(payload).length) {
        toast.info("No changes to save.");
        return;
      }

      const res = await userService.updateUser(selected._id, payload);
      if (res.success) {
        toast.success("User updated successfully!");
        onCleared?.();
        onUpdated?.();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                {...field}
                id="name"
                placeholder="Full name"
                disabled={isSubmitting}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <FieldDescription>Email cannot be changed.</FieldDescription>
          <Input
            id="email"
            value={selected.email}
            disabled
            className={`${inputClassName} opacity-50 cursor-not-allowed`}
          />
        </Field>
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <select
                {...field}
                id="role"
                disabled={isSubmitting}
                className={inputClassName}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="mt-6! flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-300 hover:bg-primary-100 px-3!"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner /> Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCleared}
          className="px-3! text-primary-100"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default UpdateUserForm;
