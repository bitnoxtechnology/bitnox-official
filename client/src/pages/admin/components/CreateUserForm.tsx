import React, { useState } from "react";
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
  createUserSchema,
  type CreateUserInput,
} from "@/lib/validations/user-validator";

interface Props {
  onCreated?: () => void;
}

const inputClassName =
  "h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!";

const CreateUserForm: React.FC<Props> = ({ onCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "admin",
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true);
    try {
      const res = await userService.createUser(data);
      if (res.success) {
        toast.success("User created successfully!");
        form.reset({ name: "", email: "", role: "admin" });
        onCreated?.();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mt-4! md:mt-6! mb-4! text-white">
        Add New User
      </h2>
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
                  placeholder="e.g. John Doe"
                  disabled={isSubmitting}
                  className={inputClassName}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  disabled={isSubmitting}
                  className={inputClassName}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <FieldDescription>
                  Super Admin can manage users; Admin can manage content only.
                </FieldDescription>
                <select
                  {...field}
                  id="role"
                  disabled={isSubmitting}
                  className={inputClassName}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="mt-6!">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-300 hover:bg-primary-100"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner /> Creating...
              </span>
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
